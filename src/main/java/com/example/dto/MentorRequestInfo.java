package com.example.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MentorRequestInfo {
    private Long requestId; // 요청 ID
    private Long id;        // 멘티의 userId (프론트엔드에서 기대하는 필드명)
    private String name;    // 멘티 이름
    private Integer age;    // 멘티 나이
}







