package com.example.VO;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ReportVO {
    private Integer reportId;
    private Integer reporterId;
    private Integer targetUserId;
    

    private String reportType; // ✅ CHAT or GENERAL
    private String reasonCode; // ✅ EX: 욕설, 도배 등
    private String reason;

    private String status;
    private LocalDateTime createdAt;

    private Long chatMessageId; // ✅ CHAT 신고일 경우 사용

    private Integer banDays;        // ✅ 정지 일수
    private String banReason;       // ✅ 정지 상세 사유
    private LocalDateTime banExpireAt; // ✅ 정지 만료일

    private Boolean appealRequested;  // ✅ 이의제기 여부

    // 편의를 위한 추가 필드
    private Integer reportCount;
    private String reporterNickname;
    private String targetNickname;
    private boolean targetBanned;
}
