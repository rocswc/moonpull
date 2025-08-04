package com.example.service;

import com.example.dto.MyMentorlistDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MyMentorlistService {
//1
    public List<MyMentorlistDTO> getMyMentors() {
        return List.of(
            new MyMentorlistDTO(1L, "김역사", "한국사", 4.9, "10년", "서울대 한국사 전공, 풍부한 강의 경력"),
            new MyMentorlistDTO(2L, "이수학", "수학", 4.7, "7년", "수능 대비 수학 전문가, 개념 중심 학습")
        );
    }
}
