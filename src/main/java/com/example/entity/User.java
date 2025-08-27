package com.example.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "user") // 실제 DB 테이블명 맞춰주세요
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // user PK

    private String name;
    private String email;
    private String role;

    // 필요 시 Mentor, Mentee 등 관계 매핑
}
