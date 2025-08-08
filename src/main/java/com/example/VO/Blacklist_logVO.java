package com.example.VO;

import java.time.LocalDateTime;

import lombok.Data;
@Data
public class Blacklist_logVO {
	private Integer logId;
	private Integer userId;
	private Integer bannedBy;
	private String reasonCode;
	private String reasonDetail;
	private Integer durationDays;
	private LocalDateTime expiredAt;
	private String action;          // 'BAN' or 'UNBAN'
	private String appealStatus;
	private LocalDateTime createdAt;
	private String adminMemo;
}
