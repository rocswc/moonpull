package com.example.dto;

import lombok.Data;
import java.util.List;

@Data
public class MentorResponseDTO {
    private Long id;                  // mentor_id
    private Long userId;              // ✅ user_id (Chat에서 필요)
    private String name;
    private String introduction;
    private Double rating;
    private Integer students;
    private String experience;
    private String specialties;  // mentor 테이블의 specialties 컬럼은 String 타입
    private String[] specialtiesArray;  // 프론트엔드용 배열 형태
}
