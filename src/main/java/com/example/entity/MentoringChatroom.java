package com.example.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mentoring_chatroom")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentoringChatroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chat_id")
    private Long chat_id;

    @Column(nullable = true)
    private String content;

    @Column(name = "sent_at", nullable = true)
    private LocalDateTime sentAt;

    @Column(name = "is_reported", nullable = false)
    private boolean isReported = false;

    @Column(name = "participant1_id", nullable = false)
    private Long participant1Id; // 멘티

    @Column(name = "participant2_id", nullable = false)
    private Long participant2Id; // 멘토

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
