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
	 /** 몽고디비에서 자동 생성되는 고유 ID */
    @Id
    private String id;

    /** 학교(중학교, 고등학교 등) */
    @Field("school")
    private String school;

    /** 학년(1학년, 2학년, 3학년) */
    @Field("grade")
    private String grade;

    /** 과목(국사, 영어, 한국어 등) */
    @Field("subject")
    private String subject;

    /** 문제 내용 */
    @Field("question")
    private String question;

    /** 문제의 지문 */
    @Field("passage")
    private String passage;

    /** 보기 목록 (0~5개 요소) */
    @Field("choices")
    private List<String> choices;

    /** 정답(복수 정답 가능) */
    @Field("answer")
    private List<String> answer;

    /** 해설 */
    @Field("explanation")
    private String explanation;

    /** 사용자가 제출한 답(문자열) */
    @Field("userAnswer")
    private String userAnswer;

    /** 데이터가 생성된 시각 */
    @CreatedDate
    @Builder.Default
    @Field("createdAt")
    private Instant createdAt = Instant.now();

    /** 정답/오답 여부 */
    @Field("isCorrect")
    private boolean isCorrect;
}