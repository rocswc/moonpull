package com.example.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDTO {
    private Long questionId;
    private Long menteeId;
    private Long mentorId;
    private String menteeName;
    private String mentorName;
    private String subject;
    private String title;
    private String content;
    private String status;
    private String createdAt;
    private String answeredAt;
    private String answerContent;
}

