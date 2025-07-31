package com.example.controller;

import com.example.VO.ReportVO;
import com.example.DAO.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api") 
@RequiredArgsConstructor
public class ReportController {

    private final ReportRepository reportRepository;

    // ✅ 신고 등록
    @PostMapping("/admin/report")
    public void submitReport(@RequestBody ReportVO reportVO) {
        reportRepository.insertReport(reportVO);
    }

    // ✅ 관리자용 신고 목록 조회
    @GetMapping("/admin/reports")
    public List<ReportVO> getAllReports() {
        return reportRepository.getAllReports();
    }
    
    @GetMapping("/api/admin/reports/top")
    public List<ReportVO> getTopReportedUsers() {
        return reportRepository.getTopReportedUsers();
    }
}
