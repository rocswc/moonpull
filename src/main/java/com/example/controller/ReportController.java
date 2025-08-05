package com.example.controller;

import com.example.VO.ReportVO;

import jakarta.servlet.http.HttpServletRequest;

import com.example.DAO.ReportRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api") 
@RequiredArgsConstructor
public class ReportController {

    private final ReportRepository reportRepository;

    // ✅ 신고 등록
    @PostMapping("/admin/report")
    public ResponseEntity<Void> submitReport(@RequestBody ReportVO reportVO) {
    	
        System.out.println("신고 요청 들어옴: " + reportVO);
        
        if (reportVO.getTargetUserId() != null && reportVO.getTargetUserId() == 0) {
            reportVO.setTargetUserId(null);
        }

        // ✅ 2. targetMentorId가 0이면 null로 처리 (선택적 적용)
        if (reportVO.getTargetMentorId() != null && reportVO.getTargetMentorId() == 0) {
            reportVO.setTargetMentorId(null);
        }

        // ✅ 3. 신고 사유 욕설 체크 (선택적 로깅 또는 마스킹)
        if (reportVO.getReason() != null && reportVO.getReason().matches(".*(시발|ㅅㅂ|욕설).*")) {
            System.out.println("⚠️ 신고 내용에 욕설 포함됨: " + reportVO.getReason());
            // 또는 return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        reportRepository.insertReport(reportVO);
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
        return reportRepository.getTopReportedUsers();
    }
}
