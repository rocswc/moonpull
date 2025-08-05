package com.example.dto;

import lombok.Data;

@Data
public class MyMenteeListDTO {
    private Long mentoringProgressId;
    private Long menteeId;
    private String menteeName;
    private int menteeAge;
    private double correctRate;
    private double incorrectRate;
    private int totalQuestions;
    private int feedbackCount;
    private String recentSubject;
    private String connectionStatus; // 진행중, 종료됨 등
}
