package com.example.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class WrongAnswerCreateRequestDTO {
    @NotBlank private String school;       // 중학교/고등학교
    @NotBlank private String grade;        // 1학년/2학년/3학년
    @NotBlank private String subject;      // 국사/영어/한국어
    @NotBlank private String question;     // 문제문
    private String passage;                // 지문(선택)

    @NotNull  private List<String> choices;   // 보기 배열 (0~5개)
    private List<String> answer;              // 정답(복수 가능) - 프론트가 문자열로 줄 때 사용
    private Integer correctAnswerIndex;       // 프론트가 '정답 인덱스'로 줄 때 사용

    private String explanation;            // 해설(선택)
    @NotBlank private String userAnswer;   // 사용자가 제출한 답(문자열)
    @NotNull  private Boolean isCorrect;   // 정오 여부
}