package com.example.controller;
import com.example.DAO.MemberRepository;
import com.example.VO.ChatMessage;
import com.example.VO.ChatRequestDtos.CreateRequest;
import com.example.VO.ChatRequestDtos.RequestPushed;
import com.example.VO.ChatRoom;
import com.example.service.RtChatService;
import lombok.RequiredArgsConstructor;
import java.security.Principal;
import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class RtChatStompController {

    private final RtChatService rtChatService;
    private final SimpMessagingTemplate broker;
    private final MemberRepository memberRepository; // 👈 member 테이블 조회용
    
    
    // 메시지 전송: /app/rt-chat/rooms/{roomId}/send
    public static record SendPayload(Long senderId, String content) {}

    @MessageMapping("/rooms/{roomId}/send")
    public void send(@DestinationVariable Long roomId, @Payload SendPayload payload) {
        ChatMessage saved = rtChatService.saveMessage(roomId, payload.senderId(), payload.content());
        // 구독 주소: /topic/rt-chat/rooms/{roomId}
        //broker.convertAndSend("/topic/rt-chat/rooms/" + roomId, saved);
        broker.convertAndSend("/topic/rooms/" + roomId, saved);  // ← 프론트 구독과 동일
        
        
        
        
    }
      
}
