package com.example.VO;

import lombok.Data;

@Data
public class MentorReviewVO {
    private Integer reviewId;
    private Integer rating;
    private Integer menteeId;
    private Integer mentorId;
    private String feedback;
}
