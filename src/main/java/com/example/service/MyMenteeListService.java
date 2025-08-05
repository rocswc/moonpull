package com.example.service;

import com.example.DAO.MyMenteeListMapper;
import com.example.dto.MyMenteeListDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MyMenteeListService {

    private final MyMenteeListMapper myMenteeListMapper;

    public List<MyMenteeListDTO> getMyMentees(Long mentorId) {
        return myMenteeListMapper.findMyMentees(mentorId);
    }

    public void acceptMentee(Long progressId) {
        myMenteeListMapper.acceptMentoringRequest(progressId);
    }
}
