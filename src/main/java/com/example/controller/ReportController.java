package com.example.controller;

import com.example.VO.ReportVO;

import jakarta.servlet.http.HttpServletRequest;

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

    // ✅ 신고 등록
    @PostMapping("/admin/report")
    public ResponseEntity<Void> submitReport(@RequestBody ReportVO reportVO) {
        System.out.println("🚨 신고 요청 들어옴: " + reportVO);

        if (reportVO.getTargetUserId() != null && reportVO.getTargetUserId() == 0) {
            return ResponseEntity.badRequest().build(); // 잘못된 요청
        }
        
        
        

        reportRepository.insertReport(reportVO);
        
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
        return reportRepository.getTopReportedUsers();
    }
}
