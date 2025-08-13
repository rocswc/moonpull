package com.example.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "mentor")
@Getter
@Setter
@NoArgsConstructor
public class Mentor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mentor_id") // PK
    private Long mentorId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "specialties", length = 1000)
    private String specialties;

    @Column(name = "introduction", length = 2000)
    private String introduction;

    @Column(name = "status")
    private String status; // ✅ 상태 (APPROVED, REVOKED 등)

    @Column(name = "student_course")
    private String studentCourse; // ✅ 학생 과정 (ex: 대학명, 전공)

    @Column(name = "score")
    private Double score; // ✅ 평점

    @Column(name = "intro", length = 2000)
    private String intro; // ✅ 간단 소개

    @Column(name = "student_count")
    private Integer studentCount;

    @Column(name = "experience_years")
    private Integer experienceYears;

    // ✅ DB에는 없지만 컨트롤러 응답용으로 사용
    @Transient
    private String name;

    @Transient
    private String subject;

    public Mentor(String name, String subject) {
        this.name = name;
        this.subject = subject;
    }
}
