package com.example.DAO;

import com.example.dto.MyMentorlistDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MyMentorlistDAO {
    List<MyMentorlistDTO> getMentorsByMenteeId(@Param("menteeId") Long menteeId);
}
