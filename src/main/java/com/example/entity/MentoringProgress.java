package com.example.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "mentoring_progress")
public class MentoringProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mentoring_progress_id")
    private int mentoringProgressId;

    @Column(name = "matching_id", nullable = false)
    private int matchingId;

    @Column(name = "user_id", nullable = false)
    private int userId;

    @Column(name = "mentee_id", nullable = false)
    private int menteeId;

    @Column(name = "mentor_id", nullable = false)
    private int mentorId;

    @Column(name = "chat_id")
    private Integer chatId;

    @Column(name = "connection_status")
    private String connectionStatus;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "subject_id")
    private Integer subjectId;
}
