package com.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MoonpullChatResponseDTO {

    private String response;
    private String status;
    private LocalDateTime timestamp;
    private String sessionId;

    // 🔧 기본 success 메서드 (매개변수 1개)
    public static MoonpullChatResponseDTO success(String response) {
        return new MoonpullChatResponseDTO(response, "success", LocalDateTime.now(), null);
    }

    // 🆕 sessionId 포함 success 메서드 (매개변수 2개)
    public static MoonpullChatResponseDTO success(String response, String sessionId) {
        return new MoonpullChatResponseDTO(response, "success", LocalDateTime.now(), sessionId);
    }

    // 🔧 error 메서드 수정
    public static MoonpullChatResponseDTO error(String errorMessage) {
        return new MoonpullChatResponseDTO(errorMessage, "error", LocalDateTime.now(), null);
    }
}