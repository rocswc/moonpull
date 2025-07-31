package com.example.VO;

import lombok.Data;

@Data
public class MentorReviewVO {
    private int reviewId;
    private int rating;
    private int menteeId;
    private int mentorId;
    private String feedback;
}