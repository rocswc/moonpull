package com.example.service;

import com.example.dto.MyMentorlistDTO;

import java.util.List;

public interface MyMentorlistService {
    List<MyMentorlistDTO> getMyMentors(Long menteeId);
}
