package com.example.controller;

import com.example.dto.AcceptRequestDTO;
import com.example.entity.Mentee;
import com.example.entity.Mentor;
import com.example.entity.MentoringProgress;
import com.example.entity.MentoringChatroom;
import com.example.service.MentoringChatroomService;
import com.example.DAO.MenteeRepository;
import com.example.DAO.MentorEntityRepository;
import com.example.DAO.MentoringProgressRepository;
import com.example.DAO.MentoringChatroomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mentoring")
@RequiredArgsConstructor
public class MentoringChatroomController {

    private final MentoringChatroomService mentoringChatroomService;
    private final MentoringProgressRepository mentoringProgressRepository;
    private final MenteeRepository menteeRepository;
    private final MentorEntityRepository mentorEntityRepository;
    private final MentoringChatroomRepository mentoringChatroomRepository;

    @PostMapping("/accept")
    public ResponseEntity<Map<String, Integer>> acceptRequest(@RequestBody AcceptRequestDTO dto) {
        int chatId = mentoringChatroomService.createChatroomAndUpdateProgress(dto.getMenteeId(), dto.getMentorId());
        return ResponseEntity.ok(Map.of("chatId", chatId));
    }

    @GetMapping("/chatId")
    public ResponseEntity<Map<String, Integer>> getChatId(
            @RequestParam int menteeId,
            @RequestParam int mentorId
    ) {
        MentoringProgress progress = mentoringProgressRepository.findByMenteeIdAndMentorId(menteeId, mentorId);
        if (progress == null || progress.getChatId() == null) {
            return ResponseEntity.status(404).body(Map.of("chatId", -1));
        }
        return ResponseEntity.ok(Map.of("chatId", progress.getChatId()));
    }

    @GetMapping("/chatIdByUserId")
    public ResponseEntity<Map<String, Integer>> getChatIdByUserId(
            @RequestParam Long menteeUserId,
            @RequestParam Long mentorUserId
    ) {
        // menteeUserId로 mentee_id 조회 (중복 가능성 고려: 가장 최근 1건 사용)
        Mentee mentee = menteeRepository.findTopByUserIdOrderByMenteeIdDesc(menteeUserId)
                .orElse(null);
        if (mentee == null) {
            return ResponseEntity.status(404).body(Map.of("chatId", -1));
        }

        // mentorUserId로 mentor_id 조회
        Mentor mentor = mentorEntityRepository.findByUserId(mentorUserId)
                .orElse(null);
        if (mentor == null) {
            return ResponseEntity.status(404).body(Map.of("chatId", -1));
        }

        MentoringProgress progress = mentoringProgressRepository.findByMenteeIdAndMentorId(
                mentee.getMenteeId().intValue(), 
                mentor.getMentorId().intValue()
        );
        
        if (progress == null || progress.getChatId() == null) {
            return ResponseEntity.status(404).body(Map.of("chatId", -1));
        }
        return ResponseEntity.ok(Map.of("chatId", progress.getChatId()));
    }

    // 메시지 저장
    @PostMapping("/messages")
    public ResponseEntity<?> saveMessage(@RequestBody Map<String, Object> request) {
        try {
            Long roomId = Long.valueOf(request.get("roomId").toString());
            Long senderId = Long.valueOf(request.get("senderId").toString());
            String content = request.get("content").toString();

            System.out.println("📥 [MentoringChatroom 메시지 저장] roomId=" + roomId + ", senderId=" + senderId + ", content=" + content);

            MentoringChatroom chatroom = mentoringChatroomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + roomId));

            System.out.println("🔍 [저장 전] chatroom.content=" + chatroom.getContent());
            chatroom.setContent(content);
            chatroom.setSentAt(LocalDateTime.now());
            System.out.println("🔍 [저장 후] chatroom.content=" + chatroom.getContent());
            
            MentoringChatroom saved = mentoringChatroomRepository.save(chatroom);
            System.out.println("✅ [MentoringChatroom 메시지 저장 완료] chatId=" + saved.getChat_id() + ", content=" + saved.getContent());
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("❌ [MentoringChatroom 메시지 저장 실패] " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("메시지 저장 실패: " + e.getMessage());
        }
    }

    // 메시지 조회
    @GetMapping("/messages")
    public ResponseEntity<?> getMessage(@RequestParam Long roomId) {
        try {
            System.out.println("📥 [MentoringChatroom 메시지 조회] roomId=" + roomId);

            MentoringChatroom chatroom = mentoringChatroomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + roomId));

            // 디버깅용: 전체 채팅방 목록 출력
            List<MentoringChatroom> allChatrooms = mentoringChatroomRepository.findAll();
            System.out.println("🔍 [전체 채팅방 목록]");
            for (MentoringChatroom room : allChatrooms) {
                System.out.println("  - chat_id=" + room.getChat_id() + ", content=" + room.getContent());
            }
            System.out.println("🔍 [조회된 채팅방 정보] chat_id=" + chatroom.getChat_id() + ", content=" + chatroom.getContent() + ", sentAt=" + chatroom.getSentAt());

            return ResponseEntity.ok(chatroom);
        } catch (Exception e) {
            System.err.println("❌ [MentoringChatroom 메시지 조회 실패] " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("메시지 조회 실패: " + e.getMessage());
        }
    }
}
