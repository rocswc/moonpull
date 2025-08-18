package com.example.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
@Table(name = "mentoring_progress")
@IdClass(MentoringProgressId.class)
public class MentoringProgress {

    @Id
    @Column(name = "mentee_id", nullable = false)
    private int menteeId;

    @Id
    @Column(name = "mentor_id", nullable = false)
    private int mentorId;

    @Column(name = "matching_id", nullable = false)
    private int matchingId;

    @Column(name = "user_id", nullable = false)
    private int userId;

    @Column(name = "chat_id")
    private Integer chatId;

    @Column(name = "connection_status")
    private String connectionStatus;

    @Column(name = "start_date")
    private LocalDate startDate; // DB의 start_date

    @Column(name = "end_date")
    private LocalDate endDate;   // DB의 end_date

    @Column(name = "subject_id")
    private Integer subjectId;   // DB의 subject_id
}
