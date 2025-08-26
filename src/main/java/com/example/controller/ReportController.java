package com.example.controller;

import com.example.VO.ChatMessage;
import com.example.VO.FcmTokenVO;
import com.example.VO.NotificationVO;
import com.example.VO.ReportVO;
import com.example.service.FcmPushService;
import com.example.service.FcmTokenService;
import com.example.service.NotificationService;
import com.example.service.RtChatService;
import com.example.DAO.ChatMessageDocRepo;
import com.example.DAO.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.bson.types.ObjectId;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportRepository reportRepository;
    private final FcmTokenService fcmTokenService;
    private final FcmPushService fcmPushService;
    private final NotificationService notificationService;
    private final RtChatService rtChatService;
    private final ChatMessageDocRepo chatMessageDocRepo;
    // ✅ 신고 등록
    @PostMapping("/admin/report")
    public ResponseEntity<?> submitReport(@RequestBody ReportVO reportVO) {
        try {
            System.out.println("🚨 신고 요청 들어옴: " + reportVO);
            System.out.println("🚨 받은 chatMessageId = " + reportVO.getChatMessageId());

            if (reportVO.getTargetUserId() == null || reportVO.getTargetUserId() == 0) {
                return ResponseEntity.badRequest().body("❌ 잘못된 요청: targetUserId 없음");
            }

            // 1) 신고 저장
            int result = reportRepository.insertReport(reportVO);
            if (result <= 0) {
                return ResponseEntity.status(500).body("❌ 신고 저장 실패");
            }

            // 2) 신고 누적 카운트 확인
            int count = reportRepository.countReportsByTarget(reportVO.getTargetUserId());
            System.out.println("📊 신고 누적 횟수 = " + count);

            // 3) 3회 이상이면 관리자에게 알림 & 푸시
            if (count >= 3) {
                List<Integer> adminIds = List.of(35); // TODO: 실제 관리자 ID 조회 로직으로 교체

                for (Integer adminId : adminIds) {
                    // DB 알림 저장
                    NotificationVO noti = new NotificationVO();
                    noti.setUserId(adminId);
                    noti.setMessage("🚨 유저 " + reportVO.getTargetUserId() + "가 신고 " + count + "회 이상 누적됨");
                    notificationService.insertNotification(noti);

                    // 관리자 FCM 토큰 불러오기
                    List<FcmTokenVO> tokens = fcmTokenService.tokensOf(adminId);
                    if (tokens != null) {
                        for (FcmTokenVO tokenVO : tokens) {
                            fcmPushService.sendMessage(
                                    tokenVO.getToken(),
                                    "🚨 신고 누적 알림",
                                    "유저 " + reportVO.getTargetUserId() + "가 " + count + "회 이상 신고되었습니다."
                            );
                        }
                    }
                }
            }

            System.out.println("🪵 신고 저장 완료 → targetUserId=" + reportVO.getTargetUserId() + ", reason=" + reportVO.getReason());
            return ResponseEntity.ok().body("✅ 신고 접수 완료");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("❌ 서버 에러: " + e.getMessage());
        }
    }
    // ✅ 관리자용 신고 목록 조회
    @GetMapping("/admin/reports")
    public List<ReportVO> getAllReports(HttpServletRequest request) {
        System.out.println("Authorization: " + request.getHeader("Authorization"));
        System.out.println("신고내용 출력");
        return reportRepository.getAllReports();
    }

    @GetMapping("/admin/reports/top")
    public List<ReportVO> getTopReportedUsers() {
        System.out.println("▶ GET /api/admin/reports/top");
        List<ReportVO> list = reportRepository.getTopReportedUsers();
        System.out.println("◀ size=" + list.size());
        list.forEach(v -> System.out.println(
                "uid=" + v.getTargetUserId()
                        + ", nick=" + v.getTargetNickname()
                        + ", cnt=" + v.getReportCount()
                        + ", banned=" + v.isTargetBanned()
        ));
        return list;
    }
     
    @GetMapping("/admin/report/{reportId}/context")
    public ResponseEntity<Map<String, Object>> getReportedMessageContext(
            @PathVariable Integer reportId,
            @RequestParam(defaultValue = "5") int minutesBefore,
            @RequestParam(defaultValue = "5") int minutesAfter
    ) {
        log.info("📥 신고 문맥 요청 들어옴 → reportId={}, before={}min, after={}min", reportId, minutesBefore, minutesAfter);

        ReportVO report = reportRepository.getReportById(reportId);
        if (report == null || report.getChatMessageId() == null) {
            log.warn("❌ report 또는 chatMessageId null: report={}", report);
            return ResponseEntity.notFound().build();
        }

        String mongoMessageId = report.getChatMessageMongoId();
        log.info("🔍 mongoMessageId = {}", mongoMessageId);

        Optional<ChatMessage> optionalMessage = chatMessageDocRepo.findById(mongoMessageId);
        if (optionalMessage.isEmpty()) {
            log.warn("❌ Mongo 메시지 없음 → mongoMessageId={}", mongoMessageId);
            return ResponseEntity.notFound().build();
        }

        ChatMessage target = optionalMessage.get();
        log.info("✅ 대상 메시지: {}", target);

     
        

        Instant start = target.getCreatedAt().minus(minutesBefore, ChronoUnit.MINUTES);
        Instant end = target.getCreatedAt().plus(minutesAfter, ChronoUnit.MINUTES);
        log.info("⏱️ 조회 범위: {} ~ {}", start, end);
        List<ChatMessage> context = chatMessageDocRepo.findByChatroomIdAndCreatedAtBetweenOrderByCreatedAtAsc(
            target.getChatroomId(),
            Date.from(start),
            Date.from(end)
        );
        
   

        if (context.stream().noneMatch(m -> m.getId().equals(target.getId()))) {
            context.add(0, target);
            log.info("🧩 기준 메시지 직접 추가 (문맥 내에 없음)");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("messages", context);
        result.put("highlightedMessageId", target.getId().toHexString());
        log.info("🧪 target.getId() = {}", target.getId());
        log.info("🧪 target.getId() class = {}", target.getId().getClass().getName());
        log.info("🧪 신고된 mongoMessageId: {}", mongoMessageId);
        return ResponseEntity.ok(result);
        		
     

       
    }




    
    
}
