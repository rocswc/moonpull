package com.example.DAO;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.VO.ReportVO;

@Mapper
public interface ReportRepository {

    // 전체 신고 목록 조회
    List<ReportVO> getAllReports();

    // 신고 등록
    void insertReport(ReportVO reportVO);
    
    List<ReportVO> getTopReportedUsers();
}
