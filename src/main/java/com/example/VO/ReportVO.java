package com.example.VO;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL) // ✅ null 값은 응답에서 제외
public class ReportVO {
    private Integer reportId;
    private Integer reporterId;
    private Integer targetUserId;

    private String reportType; // CHAT or GENERAL
    private String reasonCode; // 욕설, 도배 등
    private String reason;

    private String status;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") // ✅ 직렬화 안전
    private LocalDateTime createdAt;
    @JsonProperty("chatMessageId")
    private Long   chatMessageId;

    private Integer banDays;
    private String banReason;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime banExpireAt;

    private Boolean appealRequested;
    private String chatMessageMongoId;
    // 편의 필드
    private Long reportCount;
    private String reporterNickname;
    private String targetNickname;
    private boolean targetBanned;
    private String targetLoginId;
}
