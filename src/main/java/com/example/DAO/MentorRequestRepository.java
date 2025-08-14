package com.example.DAO;

import com.example.entity.MentorRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MentorRequestRepository extends JpaRepository<MentorRequest, Long> {
    List<MentorRequest> findByMentorIdAndStatus(Long mentorId, String status);
    
    // 멘토의 모든 요청 조회 (REQUESTED, ACCEPTED)
    List<MentorRequest> findByMentorIdAndStatusIn(Long mentorId, List<String> statuses);
}
