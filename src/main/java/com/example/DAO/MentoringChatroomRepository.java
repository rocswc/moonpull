package com.example.DAO;

import com.example.entity.MentoringChatroom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MentoringChatroomRepository extends JpaRepository<MentoringChatroom, Long> {
    Optional<MentoringChatroom> findByParticipant1IdAndParticipant2Id(Long menteeId, Long mentorId);
}
