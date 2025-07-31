package com.example.service;

import com.example.DAO.MyMentorlistDAO;
import com.example.dto.MyMentorlistDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MyMentorlistServiceImpl implements MyMentorlistService {

    private final MyMentorlistDAO myMentorlistDAO;

    @Autowired
    public MyMentorlistServiceImpl(MyMentorlistDAO myMentorlistDAO) {
        this.myMentorlistDAO = myMentorlistDAO;
    }

    @Override
    public List<MyMentorlistDTO> getMyMentors(Long menteeId) {
        return myMentorlistDAO.getMentorsByMenteeId(menteeId);
    }
}
