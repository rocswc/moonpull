package com.example.controller;

import com.example.entity.Mentor;
import com.example.DAO.TeacherRepository;  // ✅ DAO 패키지로 변경된 import 경로
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/teacher") // ✅ 프론트에서 /api/teacher/{id}로 요청
@RequiredArgsConstructor
public class TeacherInfoController {

    private final TeacherRepository teacherRepository; // ✅ JPA 기반 Repository

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, String>> getMentorInfo(@PathVariable Long userId) {
        Optional<Mentor> optionalMentor = teacherRepository.findByUserId(userId); // ← 여기를 수정

        if (optionalMentor.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body(Map.of("error", "Mentor not found"));
        }

        Mentor mentor = optionalMentor.get();
        return ResponseEntity.ok(Map.of(
            "name", mentor.getName(),
            "subject", mentor.getSubject() != null ? mentor.getSubject() : "미지정",
            "avatar", mentor.getName().substring(0, 1)
        ));
    }
}