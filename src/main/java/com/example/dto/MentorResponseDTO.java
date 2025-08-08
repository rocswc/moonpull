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
    private List<String> specialties;
}
