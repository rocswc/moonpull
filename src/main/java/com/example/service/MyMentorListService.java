package com.example.service;

import com.example.DAO.MyMentorListRepository;
import com.example.dto.MyMentorListDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MyMentorListService {

    private final MyMentorListRepository repository;

    public MyMentorListService(MyMentorListRepository repository) {
        this.repository = repository;
    }

    // 진행중 멘토링 불러오기
    public List<MyMentorListDTO> getActiveMentorings(int menteeId) {
        return repository.findByMenteeId(menteeId);
    }

    // 멘토링 종료
    public int endMentoring(int progressId) {
        return repository.endMentoring(progressId);
    }
}
