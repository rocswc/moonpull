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
public class MentoringChatroomService {

    private final MentoringChatroomRepository mentoringChatroomRepository;
    private final MentoringProgressRepository mentoringProgressRepository;

    public int createChatroomAndUpdateProgress(int menteeId, int mentorId) {
        MentoringChatroom chatroom = new MentoringChatroom();
        chatroom.setParticipant1Id((long) menteeId);
        chatroom.setParticipant2Id((long) mentorId);
        chatroom.setCreatedAt(LocalDateTime.now());

        mentoringChatroomRepository.save(chatroom);
        int chatId = Math.toIntExact(chatroom.getChatId()); // Long -> int

        MentoringProgress progress = mentoringProgressRepository.findByMenteeIdAndMentorId(menteeId, mentorId);
        if (progress != null) {
            progress.setChatId(chatId);
            progress.setConnectionStatus("in_progress");
            mentoringProgressRepository.save(progress);
        } else {
            throw new IllegalStateException("멘토링 진행 정보가 없습니다.");
        }

        return chatId;
    }
}