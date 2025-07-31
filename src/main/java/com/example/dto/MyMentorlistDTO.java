package com.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MyMentorlistDTO {
    private Long id;
    private String name;
    private String subject;
    private double rating;
    private String experience;
    private String intro;
}
