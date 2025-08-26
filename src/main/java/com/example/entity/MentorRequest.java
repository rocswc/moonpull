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

    @Column(name = "mentor_id", nullable = false)
    private Long mentorId;

    @Column(name = "mentee_id", nullable = false)
    private Long menteeId;

    @Column(nullable = false)
    private String status; // REQUESTED, ACCEPTED, REJECTED 등

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "end_date")
    private LocalDateTime endDate;
}
