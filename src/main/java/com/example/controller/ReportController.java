package com.example.controller;

import com.example.VO.FcmTokenVO;
import com.example.VO.ReportVO;
import com.example.service.FcmPushService;

import jakarta.servlet.http.HttpServletRequest;

import com.example.DAO.FcmTokenRepository;
import com.example.DAO.ReportRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api") 
@RequiredArgsConstructor
public class ReportController {

    private final ReportRepository reportRepository;
    private final FcmTokenRepository fcmTokenRepository;
    private final FcmPushService fcmPushService;
    // ✅ 신고 등록
    @PostMapping("/admin/report")
    public ResponseEntity<Void> submitReport(@RequestBody ReportVO reportVO ) {
        System.out.println("🚨 신고 요청 들어옴: " + reportVO);

        if (reportVO.getTargetUserId() != null && reportVO.getTargetUserId() == 0) {
            return ResponseEntity.badRequest().build(); // 잘못된 요청
        }
        
        
        

        reportRepository.insertReport(reportVO);
        int count = reportRepository.countReportsByTarget(reportVO.getTargetUserId());
        System.out.println("📊 신고 누적 횟수 = " + count);
        if (count >= 3) {
            List<FcmTokenVO> tokens = fcmTokenRepository.getTokensByUserId(reportVO.getTargetUserId());
            for (FcmTokenVO tokenVO : tokens) {
                fcmPushService.sendMessage(
                    tokenVO.getToken(),
                    "🚨 신고 누적 알림",
                    "당신은 현재 " + count + "회 이상 신고되었습니다."
                );
            }
        }
        System.out.println("🪵 프론트에서 넘어온 신고 데이터:");
        System.out.println("targetUserId = " + reportVO.getTargetUserId());
        
        System.out.println("reason = " + reportVO.getReason());
        return ResponseEntity.ok().build();
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
