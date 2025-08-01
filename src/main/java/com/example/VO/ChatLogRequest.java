package com.example.VO;

import lombok.Data;

@Data
public class ChatLogRequest {
    private String roomId;
    private String senderId;
    private String content;
}
