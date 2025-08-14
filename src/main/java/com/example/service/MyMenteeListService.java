package com.example.service;

import com.example.DAO.MyMenteeListMapper;
import com.example.dto.MyMenteeListDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class MyMenteeListService {

    private final MyMenteeListMapper myMenteeListMapper;

    public List<MyMenteeListDTO> getMyMentees(Long mentorId) {
        return myMenteeListMapper.findMyMentees(mentorId);
    }

    public void acceptMentee(Long menteeId, Long mentorId) {
        Map<String, Object> params = new HashMap<>();
        params.put("menteeId", menteeId);
        params.put("mentorId", mentorId);
        myMenteeListMapper.acceptMentoringRequest(params);
    }
}
