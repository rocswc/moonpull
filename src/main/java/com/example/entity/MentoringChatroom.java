package com.example.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "mentoring_chatroom")
public class MentoringChatroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int chatId;

    @Column(nullable = false)
    private int participant1Id;

    @Column(nullable = false)
    private int participant2Id;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
