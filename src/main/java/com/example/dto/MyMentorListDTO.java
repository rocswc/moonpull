package com.example.dto;

import lombok.Data;

@Data
public class MyMentorListDTO {
    private int progressId;     // mentoring_progress_id → progressId 매핑
    private int mentorId;
    private String mentorName;
    private String mentorIntro;
    private String career;
    private String specialty;
}
