package com.example.DAO;

import com.example.dto.MyMenteeListDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MyMenteeListMapper {
    List<MyMenteeListDTO> findMyMentees(Long mentorId);

    int acceptMentoringRequest(Long progressId);
}
