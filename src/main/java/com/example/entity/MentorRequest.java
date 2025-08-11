package com.example.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "matching")
@Getter
@Setter
public class MentorRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "matching_id")
    private Long id; // 매칭 PK

    @Column(name = "mentee_id", nullable = false)
    private Long menteeId; // mentee 테이블 PK

    @Column(name = "mentor_id", nullable = false)
    private Long mentorId; // mentor 테이블 PK

    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "match_status", nullable = false)
    private String status; // REQUESTED, ACCEPTED, COMPLETED

    @Column(name = "started_at")
    private LocalDateTime startedAt;
}
