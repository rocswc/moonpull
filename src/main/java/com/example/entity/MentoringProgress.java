package com.example.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "mentoring_progress")
public class MentoringProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int mentoringProgressId;

    @Column(nullable = false)
    private int matchingId;

    @Column(nullable = false)
    private int userId;

    @Column(nullable = false)
    private int menteeId;

    @Column(nullable = false)
    private int mentorId;

    private Integer chatId; // 처음엔 NULL일 수 있음

    private String connectionStatus;
}
