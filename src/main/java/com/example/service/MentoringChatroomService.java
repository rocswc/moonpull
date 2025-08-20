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
        System.out.println("🔍 [채팅방 생성 요청] menteeId=" + menteeId + ", mentorId=" + mentorId);
        
        try {
            // 기존 채팅방이 있는지 확인 (가장 최근 것만)
            var existingChatroomOpt = mentoringChatroomRepository
                    .findTopByParticipant1IdAndParticipant2IdOrderByCreatedAtDesc((long) menteeId, (long) mentorId);
            
            if (existingChatroomOpt.isPresent()) {
                MentoringChatroom existingChatroom = existingChatroomOpt.get();
                System.out.println("🔍 기존 채팅방 발견: chatId=" + existingChatroom.getChat_id());
                return Math.toIntExact(existingChatroom.getChat_id());
            }
            
            // 반대 방향으로도 확인
            var existingChatroomOpt2 = mentoringChatroomRepository
                    .findTopByParticipant1IdAndParticipant2IdOrderByCreatedAtDesc((long) mentorId, (long) menteeId);
            
            if (existingChatroomOpt2.isPresent()) {
                MentoringChatroom existingChatroom = existingChatroomOpt2.get();
                System.out.println("🔍 기존 채팅방 발견 (반대): chatId=" + existingChatroom.getChat_id());
                return Math.toIntExact(existingChatroom.getChat_id());
            }
        } catch (Exception e) {
            System.err.println("⚠️ 기존 채팅방 조회 중 오류: " + e.getMessage());
            // 오류가 발생하면 새로 생성
        }
        
        // 새 채팅방 생성
        MentoringChatroom chatroom = new MentoringChatroom();
        chatroom.setParticipant1Id((long) menteeId);
        chatroom.setParticipant2Id((long) mentorId);
        chatroom.setCreatedAt(LocalDateTime.now());

        mentoringChatroomRepository.save(chatroom);
        int chatId = Math.toIntExact(chatroom.getChat_id());

        MentoringProgress progress = mentoringProgressRepository.findByMenteeIdAndMentorId(menteeId, mentorId)
                .orElse(null);
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
