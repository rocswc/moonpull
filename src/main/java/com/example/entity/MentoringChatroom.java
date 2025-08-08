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
    private Long chatId;

    @Column(nullable = true)
    private String content;

    @Column(nullable = true)
    private LocalDateTime sentAt;

    @Column(nullable = false)
    private boolean isReported = false;

    @Column(nullable = false)
    private Long participant1Id; // -`멘티

    @Column(nullable = false)
    private Long participant2Id; // 멘토

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
