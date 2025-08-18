package com.example.VO;

import java.time.LocalDateTime;

import lombok.Data;


@Data
public class NotificationVO {
	  private Long notificationId;
	    private Long userId;
	    private String message;
	    private LocalDateTime createdAt;
	    private boolean isRead;
	    private String userNickname;
}
