package com.example.service;

import com.example.DAO.MenteeRepository;
import com.example.DAO.MentorEntityRepository;
import com.example.DAO.MentorRequestRepository;
import com.example.entity.Mentee;
import com.example.entity.Mentor;
import com.example.entity.MentorRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MentorRequestService {

    private final MentorRequestRepository mentorRequestRepository;
    private final MenteeRepository menteeRepository;
    private final MentorEntityRepository mentorEntityRepository;

    // 요청 생성
    public MentorRequest createRequest(Long menteeUserId, Long mentorUserId) {
        Mentee mentee = menteeRepository.findByUserId(menteeUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "멘티를 찾을 수 없습니다."));
        Mentor mentor = mentorEntityRepository.findByUserId(mentorUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "멘토를 찾을 수 없습니다."));

        MentorRequest request = new MentorRequest();
        request.setMenteeId(mentee.getMenteeId());
        request.setMentorId(mentor.getMentorId());
        request.setStatus("REQUESTED");
        request.setStartedAt(LocalDateTime.now());

        return mentorRequestRepository.save(request);
    }

    // 요청 목록 조회
    public List<MentorRequest> getRequests(Long mentorUserId) {
        Mentor mentor = mentorEntityRepository.findByUserId(mentorUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "멘토 정보를 찾을 수 없습니다."));
        return mentorRequestRepository.findByMentorIdAndStatus(mentor.getMentorId(), "REQUESTED");
    }
}
