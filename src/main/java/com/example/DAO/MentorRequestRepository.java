package com.example.DAO;

import com.example.entity.MentorRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MentorRequestRepository extends JpaRepository<MentorRequest, Long> {
    List<MentorRequest> findByMentorIdAndStatus(Long mentorId, String status);
}
