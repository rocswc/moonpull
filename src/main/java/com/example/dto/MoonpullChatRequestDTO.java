package com.example.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MoonpullChatRequestDTO {
	private String message;
	private String sessionId;  // 🆕 세션 ID
	private String userId = "anonymous";  // 🆕 사용자 ID

}
