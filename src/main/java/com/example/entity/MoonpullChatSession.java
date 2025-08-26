package com.example.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "moonpull_chat_sessions")
public class MoonpullChatSession {
    
    @Id
    private String id;
    
    private String userId;           // 사용자 ID (로그인한 경우)
    private String sessionId;        // 세션 고유 ID
    private String title;            // 채팅방 제목 (첫 메시지 기반)
    private List<ChatMessage> messages = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isActive = true; // 활성 상태
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessage {
        private String messageId;
        private String content;
        private boolean user;            // 🔧 isUser → user로 변경
        private LocalDateTime timestamp;
    }
    
 // 편의 메서드
    public void addMessage(String content, boolean isUser) {
        ChatMessage message = new ChatMessage();
        message.setMessageId(System.currentTimeMillis() + "_" + (isUser ? "user" : "ai"));
        message.setContent(content);
        message.setUser(isUser);
        message.setTimestamp(LocalDateTime.now());

        this.messages.add(message);
        this.updatedAt = LocalDateTime.now();

        // 제목이 없으면 첫 번째 사용자 메시지로 설정
        if (this.title == null && isUser && content.length() > 0) {
            // 숫자 입력을 의미있는 제목으로 변환
            if ("1".equals(content)) {
                this.title = "한국사 개념 학습";
            } else if ("2".equals(content)) {
                this.title = "한국사 문제 풀이";
            } else {
                // 일반 텍스트는 30자로 제한
                this.title = content.length() > 30 ? content.substring(0, 30) + "..." : content;
            }
        }
    }
}
    