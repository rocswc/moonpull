package com.example.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MyMentorListDTO {
    private int id;              // mentor_request.id
    private int mentorId;        // mentor_request.mentor_id
    private String mentorName;   // member.name
    private String mentorIntro;  // mentor.intro
    private String career;       // mentor.career
    private String specialty;    // mentor.specialty
    private String status;       // mentor_request.status
    private LocalDateTime startedAt; // mentor_request.started_at
}
