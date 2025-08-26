package com.example.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MyMentorListDTO {
    private int progressId;          // mentor_request.id
    private int mentorId;            // mentor.mentor_id
    private String mentorName;       // member.name
    private String mentorIntro;      // mentor.intro
    private String career;           // mentor.experience_years
    private String specialty;        // mentor.specialties
    private String status;           // 진행 상태 (in_progress, ended)
    private LocalDateTime startedAt; // mentor_request.started_at
    private LocalDateTime endedAt;   // mentor_request.end_date
}
