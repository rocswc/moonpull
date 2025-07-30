package com.example.VO;

import lombok.Data;

@Data
public class MentorReviewVO {
    private int reviewId;
    private int rating;
    private int menteeId;
    private int mentorId;
    private String score;
    // 'score'는 입력값 아님 → 제거 가능
}