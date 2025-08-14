package com.example.service;

import com.example.DAO.MenteeRepository;
import com.example.DAO.MentoringChatroomRepository;
import com.example.DAO.MentoringProgressRepository;
import com.example.entity.Mentee;
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
    private final MenteeRepository menteeRepository;

    public int createChatroomAndUpdateProgress(int menteeId, int mentorId) {
        MentoringChatroom chatroom = new MentoringChatroom();
        chatroom.setParticipant1Id((long) menteeId);
        chatroom.setParticipant2Id((long) mentorId);
        chatroom.setCreatedAt(LocalDateTime.now());

        mentoringChatroomRepository.save(chatroom);
        int chatId = Math.toIntExact(chatroom.getChatId());

        MentoringProgress progress = mentoringProgressRepository.findByMenteeIdAndMentorId(menteeId, mentorId);
        if (progress != null) {
            progress.setChatId(chatId);
            progress.setConnectionStatus("in_progress");
            mentoringProgressRepository.save(progress);
        } else {
            // 멘토링 진행 정보가 없으면 새로 생성
            progress = new MentoringProgress();
            progress.setMenteeId(menteeId);
            progress.setMentorId(mentorId);
            progress.setChatId(chatId);
            progress.setConnectionStatus("in_progress");
            progress.setMatchingId(1); // 임시값
            
            // menteeId로 Mentee 엔티티 조회하여 올바른 userId 설정
            Mentee mentee = menteeRepository.findById((long) menteeId)
                    .orElseThrow(() -> new RuntimeException("멘티를 찾을 수 없습니다. menteeId=" + menteeId));
            
            progress.setUserId(mentee.getUserId().intValue()); // 멘티의 userId
            mentoringProgressRepository.save(progress);
        }

        return chatId;
    }
}
