package com.example.controller;

import com.example.DAO.ChatMessageRepository;
import com.example.entity.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/chat/messages")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageRepository chatMessageRepository;

    /** 메시지 저장 */
    @PostMapping
    public ChatMessage saveMessage(@RequestParam Long roomId,
                                   @RequestParam String senderId,
                                   @RequestParam String content) {
        System.out.println("💬 [메시지 저장 요청] roomId=" + roomId + ", senderId=" + senderId + ", content=" + content);

        ChatMessage message = new ChatMessage();
        message.setRoomId(roomId);
        message.setSenderId(senderId);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false);

        ChatMessage saved = chatMessageRepository.save(message);
        System.out.println("✅ [메시지 저장 완료] messageId=" + saved.getMessageId());

        return saved;
    }



    @GetMapping
    public List<ChatMessage> getMessagesByRoom(@RequestParam Long roomId) {
        System.out.println("📥 [채팅방 메시지 조회] roomId=" + roomId);

        List<ChatMessage> messages = chatMessageRepository.findByRoomId(roomId);
        System.out.println("📊 [조회된 메시지 수] " + messages.size());

        return messages;
    }
}
