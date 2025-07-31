package com.example.VO;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ReportVO {
	 	private int reportId;
	    private int reporterId;
	    private int targetUserId;
	    private Integer targetMentorId; // Nullable
	    private String reason;
	    private String status;
	    private LocalDateTime createdAt;
	    private int reportCount;
	    private String reporterNickname;
	    private String targetNickname;
	    private boolean targetBanned;
}
