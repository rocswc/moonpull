package com.example.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "mentor_request")
@Getter
@Setter
public class MentorRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mentee_id", nullable = false)
    private Long menteeId; // mentee의 PK

    @Column(name = "mentor_id", nullable = false)
    private Long mentorId; // mentor의 PK

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;
}
