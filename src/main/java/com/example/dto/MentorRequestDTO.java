package com.example.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MentorRequestDTO {
    private Long menteeId;  // 요청 보낸 멘티의 userId 
    private Long mentorId;  // 요청 받는 멘토의 userId
}
