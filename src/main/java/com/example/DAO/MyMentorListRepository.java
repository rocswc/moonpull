package com.example.DAO;

import com.example.dto.MyMentorListDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MyMentorListRepository {
    List<MyMentorListDTO> findByMenteeId(@Param("menteeId") int menteeId);
}
