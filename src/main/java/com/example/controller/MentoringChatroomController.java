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
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mentoring")
@RequiredArgsConstructor
@Slf4j
public class MentoringChatroomController {

    private final MentoringChatroomService mentoringChatroomService;
    private final MentoringProgressRepository mentoringProgressRepository;
    private final MenteeRepository menteeRepository;
    private final MentorEntityRepository mentorEntityRepository;
    private final MentoringChatroomRepository mentoringChatroomRepository;
    private final SimpMessagingTemplate messagingTemplate; // ✅ WebSocket 메시지 전송용

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
        MentoringProgress progress = mentoringProgressRepository.findByMenteeIdAndMentorId(menteeId, mentorId)
                .orElse(null);
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
        ).orElse(null);
        
        if (progress == null || progress.getChatId() == null) {
            return ResponseEntity.status(404).body(Map.of("chatId", -1));
        }
        return ResponseEntity.ok(Map.of("chatId", progress.getChatId()));
    }

    // 메시지 저장
    @PostMapping("/messages")
    public ResponseEntity<?> saveMessage(@RequestBody Map<String, Object> request) {
        try {
            // 디버깅: 받은 데이터 출력
            System.out.println("🔍 [DEBUG] 받은 요청 데이터: " + request);
            System.out.println("🔍 [DEBUG] senderId 값: " + request.get("senderId") + " (타입: " + (request.get("senderId") != null ? request.get("senderId").getClass().getSimpleName() : "null") + ")");
            System.out.println("🔍 [DEBUG] roomId 값: " + request.get("roomId") + " (타입: " + (request.get("roomId") != null ? request.get("roomId").getClass().getSimpleName() : "null") + ")");
            System.out.println("🔍 [DEBUG] content 값: " + request.get("content") + " (타입: " + (request.get("content") != null ? request.get("content").getClass().getSimpleName() : "null") + ")");
            
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

    // ========== WebSocket 메시지 처리 메서드들 ==========
    
    /**
     * ✅ WebSocket을 통한 실시간 메시지 전송
     * 멘토링 채팅방에서 메시지를 받아서 DB에 저장하고 실시간으로 브로드캐스트
     */
    @MessageMapping("/chat/send")
    public void handleChatMessage(@Payload Map<String, Object> messageData) {
        try {
            Long roomId = Long.valueOf(messageData.get("roomId").toString());
            Long senderId = Long.valueOf(messageData.get("senderId").toString());
            String content = messageData.get("content").toString();
            String senderName = messageData.get("senderName").toString();

            log.info("📩 [WebSocket 메시지 수신] roomId={}, senderId={}, content={}", roomId, senderId, content);

            // 1. DB에 메시지 저장
            MentoringChatroom chatroom = mentoringChatroomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + roomId));

            chatroom.setContent(content);
            chatroom.setSentAt(LocalDateTime.now());
            MentoringChatroom saved = mentoringChatroomRepository.save(chatroom);

            // 2. 응답 메시지 생성
            Map<String, Object> responseMessage = Map.of(
                "chatId", saved.getChat_id(),
                "roomId", roomId,
                "senderId", senderId,
                "senderName", senderName,
                "content", content,
                "sentAt", saved.getSentAt(),
                "timestamp", System.currentTimeMillis()
            );

            // 3. 해당 채팅방의 모든 참가자에게 실시간 전송
            log.info("📢 [WebSocket 브로드캐스트] → /topic/mentoring/room/{}", roomId);
            messagingTemplate.convertAndSend("/topic/mentoring/room/" + roomId, responseMessage);

            log.info("✅ [WebSocket 메시지 처리 완료] roomId={}, chatId={}", roomId, saved.getChat_id());

        } catch (Exception e) {
            log.error("❌ [WebSocket 메시지 처리 실패] error={}", e.getMessage(), e);
        }
    }

    /**
     * ✅ 채팅방 입장 처리
     * 사용자가 채팅방에 입장할 때 호출
     */
    @MessageMapping("/chat/join")
    public void handleJoinRoom(@Payload Map<String, Object> joinData) {
        try {
            Long roomId = Long.valueOf(joinData.get("roomId").toString());
            String userName = joinData.get("userName").toString();
            Long userId = Long.valueOf(joinData.get("userId").toString());

            log.info("🚪 [채팅방 입장] roomId={}, userName={}, userId={}", roomId, userName, userId);

            // 입장 메시지 생성
            Map<String, Object> joinMessage = Map.of(
                "type", "JOIN",
                "roomId", roomId,
                "userName", userName,
                "userId", userId,
                "message", userName + "님이 입장하셨습니다.",
                "timestamp", System.currentTimeMillis()
            );

            // 채팅방에 입장 메시지 브로드캐스트
            messagingTemplate.convertAndSend("/topic/mentoring/room/" + roomId, joinMessage);

        } catch (Exception e) {
            log.error("❌ [채팅방 입장 처리 실패] error={}", e.getMessage(), e);
        }
    }

    /**
     * ✅ 채팅방 퇴장 처리
     * 사용자가 채팅방에서 나갈 때 호출
     */
    @MessageMapping("/chat/leave")
    public void handleLeaveRoom(@Payload Map<String, Object> leaveData) {
        try {
            Long roomId = Long.valueOf(leaveData.get("roomId").toString());
            String userName = leaveData.get("userName").toString();
            Long userId = Long.valueOf(leaveData.get("userId").toString());

            log.info("🚪 [채팅방 퇴장] roomId={}, userName={}, userId={}", roomId, userName, userId);

            // 퇴장 메시지 생성
            Map<String, Object> leaveMessage = Map.of(
                "type", "LEAVE",
                "roomId", roomId,
                "userName", userName,
                "userId", userId,
                "message", userName + "님이 퇴장하셨습니다.",
                "timestamp", System.currentTimeMillis()
            );

            // 채팅방에 퇴장 메시지 브로드캐스트
            messagingTemplate.convertAndSend("/topic/mentoring/room/" + roomId, leaveMessage);

        } catch (Exception e) {
            log.error("❌ [채팅방 퇴장 처리 실패] error={}", e.getMessage(), e);
        }
    }
}
