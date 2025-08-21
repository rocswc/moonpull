package com.example.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

//com.example.dto.WrongAnswerCreateRequestDTO
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WrongAnswerCreateRequestDTO {
 @NotNull  private Long   userId;      // ★ 추가
 @NotBlank private String questionId;  // ★ 추가 (Mongo 문항 id 문자열)
 @NotBlank private String subject;     // (이미 있음)

 @NotBlank private String school;
 @NotBlank private String grade;
 @NotBlank private String question;
 private String passage;

 @NotNull  private List<String> choices;
 private List<String>  answer;
 private Integer       correctAnswerIndex;

 private String  explanation;
 @NotBlank private String  userAnswer;
 @NotNull  private Boolean isCorrect;
}