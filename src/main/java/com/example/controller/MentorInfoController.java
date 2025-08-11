package com.example.controller;

import com.example.DAO.MemberRepository;
import com.example.DAO.TeacherRepository;
import com.example.entity.Member;
import com.example.entity.Mentor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/mentor")
@RequiredArgsConstructor
public class MentorInfoController {

    private final TeacherRepository teacherRepository;
    private final MemberRepository memberRepository; // 👈 member 테이블 조회용

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, String>> getMentorInfo(@PathVariable Long userId) {
        System.out.println("✅ [MentorInfoController] 요청 들어온 userId: " + userId);

        Optional<Mentor> optionalMentor = teacherRepository.findByUserId(userId);
        if (optionalMentor.isEmpty()) {
            System.out.println("❌ 멘토 정보 없음");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Mentor not found"));
        }

        Mentor mentor = optionalMentor.get();

        // ✅ member 테이블에서 이름, 전공 가져오기
        Optional<Member> optionalMember = memberRepository.findById(userId);
        String name = optionalMember.map(Member::getNickname).orElse("이름없음");
        String subject = optionalMember.map(Member::getMajor).orElse("미지정");

        // Transient 필드 채우기
        mentor.setName(name);
        mentor.setSubject(subject);

        System.out.println("🎯 멘토 name: " + mentor.getName());
        System.out.println("🎯 멘토 subject: " + mentor.getSubject());

        return ResponseEntity.ok(Map.of(
                "name", mentor.getName(),
                "subject", mentor.getSubject(),
                "avatar", mentor.getName().substring(0, 1)
        ));
    }
}
