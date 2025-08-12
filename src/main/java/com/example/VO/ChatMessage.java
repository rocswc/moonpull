package com.example.VO;

import java.time.LocalDateTime;

import lombok.Data;


@Data
public class ChatMessage {	
		private Long messageId;
	    private Integer chatroomId;
	    private Integer senderId;
	    private String content;
	    private LocalDateTime timestamp;
	    private Boolean isRead;		
}
