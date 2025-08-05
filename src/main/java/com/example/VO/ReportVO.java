package com.example.VO;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ReportVO {
	 	private Integer  reportId;
	    private Integer  reporterId;
	    private Integer  targetUserId;
	    private Integer targetMentorId; // Nullable
	    private String reason;
	    private String status;
	    private LocalDateTime createdAt;
	    private Integer  reportCount;
	    private String reporterNickname;
	    private String targetNickname;
	    private boolean targetBanned;
}
