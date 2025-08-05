package com.example.DAO;

import com.example.entity.MentoringProgress;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MentoringProgressRepository extends JpaRepository<MentoringProgress, Integer> {
    MentoringProgress findByMenteeIdAndMentorId(int menteeId, int mentorId);
}
