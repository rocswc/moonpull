package com.example.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MenteeInfo {
    private Long id;        // 멘티의 userId
    private String name;    // 멘티 이름
    private Integer age;    // 멘티 나이
}







