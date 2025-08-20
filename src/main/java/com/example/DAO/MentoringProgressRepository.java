package com.example.DAO;

import com.example.entity.MentoringProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MentoringProgressRepository extends JpaRepository<MentoringProgress, Integer> {

    Optional<MentoringProgress> findByMenteeIdAndMentorId(int menteeId, int mentorId);

    List<MentoringProgress> findByMentorId(int mentorId);

    List<MentoringProgress> findByMenteeId(int menteeId);
}
