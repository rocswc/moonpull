package com.example.DAO;

import com.example.entity.MentorRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MentorRequestRepository extends JpaRepository<MentorRequest, Long> {
    List<MentorRequest> findByMentorIdAndStatus(Long mentorId, String status);
    
    // 멘티 ID와 상태로 요청 조회
    List<MentorRequest> findByMenteeIdAndStatus(Long menteeId, String status);
    
    // 멘토의 모든 요청 조회 (REQUESTED, ACCEPTED)
    List<MentorRequest> findByMentorIdAndStatusIn(Long mentorId, List<String> statuses);
    
    // 중복 요청 확인을 위한 메서드
    List<MentorRequest> findByMenteeIdAndMentorIdAndStatus(Long menteeId, Long mentorId, String status);
}
