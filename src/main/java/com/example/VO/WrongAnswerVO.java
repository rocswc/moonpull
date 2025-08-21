package com.example.VO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.List;

/**
 * MongoDB 오답 기록 VO (컬렉션: wrong_answers)
 * 요청한 필드만 포함했습니다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "wrong_answers")
public class WrongAnswerVO {
	@Id
	private String id;                 // 몽고 _id (문자열)
    @Field("userId")     private Long   userId;      // ★ 추가: RDB 사용자 PK
    @Field("questionId") private String questionId; // ★ 추가: Mongo 문항 _id 문자열
    @Field("subject")    private String subject;    // (이미 있음) 과목

    @Field("school")     private String school;
    @Field("grade")      private String grade;
    @Field("question")   private String question;
    @Field("passage")    private String passage;
    @Field("choices")    private List<String> choices;
    @Field("answer")     private List<String> answer;
    @Field("explanation")private String explanation;
    @Field("userAnswer") private String userAnswer;

    @CreatedDate @Builder.Default
    @Field("createdAt")  private Instant createdAt = Instant.now();

    @Field("isCorrect")  private boolean isCorrect;
}