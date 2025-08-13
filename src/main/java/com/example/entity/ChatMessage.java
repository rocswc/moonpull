package com.example.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id   
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageId;

    @Column(name = "chatroom_id") // ✅ -------DB 컬럼 이름과 매핑
    private Long roomId;

    @Column(name = "sender_id") // ✅ DB 컬럼 이름과 매핑
    private String senderId;

    @Column(name = "content")
    private String content;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "is_read")
    private boolean isRead;
}
