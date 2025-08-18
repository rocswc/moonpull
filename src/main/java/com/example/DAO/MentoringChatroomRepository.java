package com.example.DAO;

import com.example.entity.MentoringChatroom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MentoringChatroomRepository extends JpaRepository<MentoringChatroom, Long> {
    // 반대 방향 조회도 추가
    Optional<MentoringChatroom> findTopByParticipant1IdAndParticipant2IdOrderByCreatedAtDesc(Long participant1Id, Long participant2Id);
}
