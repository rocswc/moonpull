package com.example.VO;

import java.util.Date;

import lombok.Data;

@Data
public class ChatLogRequest {
    private Long senderId;   // 숫자
    private Long roomId;     // 숫자
    private String content;
    private String type;     // 필요 없다면 삭제해도 됨
    private boolean abusive;
    private Date timestamp; 
    private Long receiverId; // // ISO8601 문자열 → Date 변환 가능
}
