package com.example.service;

import com.example.DAO.MyMentorListRepository;
import com.example.dto.MyMentorListDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class MyMentorListService {

    private final MyMentorListRepository repository;

    public MyMentorListService(MyMentorListRepository repository) {
        this.repository = repository;
    }

    // 진행중 멘토링 불러오기
    public List<MyMentorListDTO> getActiveMentorings(int menteeId) {
        log.info("🔍 진행중 멘토링 조회: menteeId={}", menteeId);
        List<MyMentorListDTO> result = repository.findByMenteeId(menteeId);
        log.info("✅ 진행중 멘토링 조회 결과: menteeId={}, count={}", menteeId, result.size());
        return result;
    }

    // 멘토링 종료
    public int endMentoring(int progressId) {
        log.info("🔍 멘토링 종료 서비스 호출: progressId={}", progressId);
        int result = repository.endMentoring(progressId);
        log.info("✅ 멘토링 종료 서비스 결과: progressId={}, updated={}", progressId, result);
        return result;
    }
}
