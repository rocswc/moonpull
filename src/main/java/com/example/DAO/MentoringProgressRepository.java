package com.example.DAO;

import com.example.entity.MentoringProgress;
import com.example.entity.MentoringProgressId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MentoringProgressRepository extends JpaRepository<MentoringProgress, MentoringProgressId> {

    MentoringProgress findByMenteeIdAndMentorId(int menteeId, int mentorId);

    // 여러 개 menteeId, mentorId 조회용 (SQL IN 절)
    @Query("SELECT mp FROM MentoringProgress mp " +
           "WHERE mp.menteeId IN :menteeIds AND mp.mentorId = :mentorId")
    List<MentoringProgress> findByMenteeIdsAndMentorId(
            @Param("menteeIds") List<Integer> menteeIds,
            @Param("mentorId") int mentorId
    );
}
