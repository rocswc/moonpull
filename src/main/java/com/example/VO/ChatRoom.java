package com.example.VO;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class ChatRoom {
    private Long chatroomId;
    private Long participant1_Id; // 작은 ID
    private Long participant2_Id; // 큰  ID
    private LocalDateTime created_at;
    private String field;
}