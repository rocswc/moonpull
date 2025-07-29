package com.example.VO;

import lombok.Data;

@Data
public class MentorVO {
    private Integer mentorId;         // PK
    private Integer userId;           // FK - member.user_id
    private String studentCourse;     // 전공 과정
    private Integer experienceYear;   // 경력 (년수)
    private String specialite;        // 전문분야
    private String introduction;      // 소개글
    private String status;            // PENDING / APPROVED / DENIED
}