// 📁 TeacherInfoController.java
package com.example.controller;

import com.example.entity.Mentor;
import com.example.DAO.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherInfoController {

    private final TeacherRepository teacherRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, String>> getMentorInfo(@PathVariable Long userId) {
        System.out.println("✅ [TeacherInfoController] 요청 들어온 userId: " + userId);
        System.out.println("🔥🔥🔥 TeacherInfoController 요청 도착 userId: " + userId);
        Optional<Mentor> optionalMentor = teacherRepository.findByUserId(userId);

        System.out.println("🔍 [TeacherInfoController] 조회 결과 존재 여부: " + optionalMentor.isPresent());

        if (optionalMentor.isEmpty()) {
            System.out.println("❌ 멘토 정보 없음");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body(Map.of("error", "Mentor not found"));
        }

        Mentor mentor = optionalMentor.get();
        System.out.println("🎯 [Mentor] name: " + mentor.getName());
        System.out.println("🎯 [Mentor] subject: " + mentor.getSubject());

        return ResponseEntity.ok(Map.of(
            "name", mentor.getName(),
            "subject", mentor.getSubject() != null ? mentor.getSubject() : "미지정",
            "avatar", mentor.getName().substring(0, 1)
        ));
    }
}
