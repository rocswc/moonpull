package com.example.controller;
import com.example.VO.ChatMessage;
import com.example.service.RtChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class RtChatStompController {

    private final RtChatService rtChatService;
    private final SimpMessagingTemplate broker;
 
    public static record SendPayload(Long senderId, String content) {}

    @MessageMapping("/rooms/{roomId}/send")
    public void send(@DestinationVariable Long roomId, @Payload SendPayload payload) {
        ChatMessage saved = rtChatService.saveMessage(roomId, payload.senderId(), payload.content());
        broker.convertAndSend("/topic/rooms/" + roomId, saved);  // ← 프론트 구독과 동일
            
    }   
}