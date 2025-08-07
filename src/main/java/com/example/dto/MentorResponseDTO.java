package com.example.dto;

import lombok.Data;
import java.util.List;

@Data
public class MentorResponseDTO {
    private Long id;
    private String name;
    private String introduction;
    private Double rating;
    private Integer students;
    private String experience;
    private List<String> specialties; // ★ specialties
}