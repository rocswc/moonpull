package com.example.controller;

import com.example.entity.ChatMessage;
import com.example.DAO.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/messages")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageRepository chatMessageRepository;

    // 메시지 저장
    @PostMapping
    public ChatMessage saveMessage(@RequestBody ChatMessage message) {
        System.out.println("💬 저장 요청: " + message); // 로그 찍기
        return chatMessageRepository.save(message);
    }

    // 메시지 조회 (채팅방 기준)
    @GetMapping
    public List<ChatMessage> getMessagesByRoom(@RequestParam Long roomId) {
        return chatMessageRepository.findByRoomId(roomId);
    }
}
