package com.example.DAO;

import com.example.dto.MyMentorListDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MyMentorListRepository {

    // 멘티 기준 진행중 멘토 리스트 조회
    List<MyMentorListDTO> findByMenteeId(@Param("menteeId") int menteeId);

    // 멘토링 종료
    int endMentoring(@Param("progressId") int progressId);
}
