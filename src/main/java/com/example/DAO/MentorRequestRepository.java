package com.example.DAO;

import com.example.entity.MentorRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MentorRequestRepository extends JpaRepository<MentorRequest, Long> {
    List<MentorRequest> findByMentorIdAndStatus(Long mentorId, String status);
}
