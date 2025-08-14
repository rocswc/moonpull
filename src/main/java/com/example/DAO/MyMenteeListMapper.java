package com.example.DAO;

import com.example.dto.MyMenteeListDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface MyMenteeListMapper {
    List<MyMenteeListDTO> findMyMentees(Long mentorId);

    int acceptMentoringRequest(Map<String, Object> params);
}
 