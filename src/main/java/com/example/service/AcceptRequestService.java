package com.example.service;

import com.example.DAO.MentoringChatroomRepository;
import com.example.DAO.MentoringProgressRepository;
import com.example.entity.MentoringChatroom;
import com.example.entity.MentoringProgress;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AcceptRequestService {

    private final MentoringChatroomRepository mentoringChatroomRepository;
    private final MentoringProgressRepository mentoringProgressRepository;

    public int accept(int menteeId, int mentorId) {
        // 1. 채팅방 생성
        MentoringChatroom chatroom = new MentoringChatroom();
        chatroom.setParticipant1Id(menteeId);
        chatroom.setParticipant2Id(mentorId);
        chatroom.setCreatedAt(LocalDateTime.now());
        mentoringChatroomRepository.save(chatroom);

        // 2. chat_id 가져오기
        int chatId = chatroom.getChatId();

        // 3. mentoring_progress 업데이트
        MentoringProgress progress = mentoringProgressRepository.findByMenteeIdAndMentorId(menteeId, mentorId);

        if (progress != null) {
            progress.setChatId(chatId);
            progress.setConnectionStatus("in_progress");
            mentoringProgressRepository.save(progress);
        } else {
            throw new IllegalStateException("멘토링 진행 정보 없음");
        }

        return chatId; // ✅ 중요: 반환하도록 수정
    }
}
