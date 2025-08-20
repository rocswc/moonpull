package com.example.controller;

import com.example.VO.FcmTokenVO;
import com.example.VO.NotificationVO;
import com.example.VO.ReportVO;
import com.example.service.FcmPushService;
import com.example.service.FcmTokenService;
import com.example.service.NotificationService;
import com.example.DAO.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReportController {

    private final ReportRepository reportRepository;
    private final FcmTokenService fcmTokenService;
    private final FcmPushService fcmPushService;
    private final NotificationService notificationService;

    // ✅ 신고 등록
    @PostMapping("/admin/report")
    public ResponseEntity<?> submitReport(@RequestBody ReportVO reportVO) {
        try {
            System.out.println("🚨 신고 요청 들어옴: " + reportVO);

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
}
