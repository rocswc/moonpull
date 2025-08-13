package com.example.controller;

import com.example.DAO.MenteeRepository;
import com.example.DAO.MentorEntityRepository;
import com.example.DAO.MemberRepository;
import com.example.entity.Mentee;
import com.example.entity.Mentor;
import com.example.entity.Member;
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

    private final MentorEntityRepository mentorEntityRepository;
    private final MenteeRepository menteeRepository; // ✅ mentee 테이블 조회용
    private final MemberRepository memberRepository; // ✅ member 테이블 조회용

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getMentorInfo(@PathVariable Long userId) {
        System.out.println("✅ [MentorInfoController] 요청 들어온 userId: " + userId);

        // 1) mentor 테이블 조회
        Optional<Mentor> optionalMentor = mentorEntityRepository.findByUserId(userId);
        if (optionalMentor.isEmpty()) {
            System.out.println("❌ 멘토 정보 없음");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Mentor not found"));
        }
        Mentor mentor = optionalMentor.get();

        // 2) member 테이블에서 이름 조회 (멘토도 멤버 테이블에 있음)
        Optional<Member> optionalMember = memberRepository.findById(userId);
        if (optionalMember.isEmpty()) {
            System.out.println("❌ 멤버 정보 없음");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Member not found"));
        }
        Member member = optionalMember.get();
        String name = member.getName();
        Integer age = 20; // 임시로 하드코딩

        // 3) Transient 필드 채우기
        mentor.setName(name);

        System.out.println("🎯 멘토 name: " + name);
        System.out.println("🎯 멘토 specialties: " + mentor.getSpecialties());

        // 4) 응답
        return ResponseEntity.ok(Map.of(
                "name", name,
                "age", age,
                "subject", mentor.getSpecialties() != null ? mentor.getSpecialties() : "",
                "avatar", name.isEmpty() ? "?" : name.substring(0, 1)
        ));
    }
}
