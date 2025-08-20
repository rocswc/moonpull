package com.example.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "question")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long questionId;
    
    @Column(name = "mentee_id", nullable = false)
    private Long menteeId;
    
    @Column(name = "mentor_id", nullable = false)
    private Long mentorId;
    
    @Column(name = "subject", nullable = false)
    private String subject;
    
    @Column(name = "title", nullable = false, length = 200)
    private String title;
    
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private QuestionStatus status = QuestionStatus.PENDING;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "answered_at")
    private LocalDateTime answeredAt;
    
    @Column(name = "answer_content", columnDefinition = "TEXT")
    private String answerContent;
    
    public enum QuestionStatus {
        PENDING,    // 답변 대기
        ANSWERED,   // 답변 완료
        CLOSED      // 질문 종료
    }
}
