package com.example.controller;

import com.example.DAO.MenteeRepository;
import com.example.DAO.MentorEntityRepository;
import com.example.DAO.MentorRequestRepository;
import com.example.DAO.MemberRepository;
import com.example.entity.Mentee;
import com.example.entity.Mentor;
import com.example.entity.MentorRequest;
import com.example.entity.Member;
import com.example.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mentee")
@RequiredArgsConstructor
public class MenteeController {

    private final MenteeRepository menteeRepository;
    private final MentorEntityRepository mentorEntityRepository;
    private final MentorRequestRepository mentorRequestRepository;
    private final MemberRepository memberRepository;

    @GetMapping("/dashboard")
    public String menteeDashboard() {
        return "멘티 전용 대시보드";
    }

    @PostMapping("/question")
    public String submitQuestion(@RequestBody String question) {
        return "질문 등록 완료: " + question;
    }

    // 멘티의 매칭된 멘토 목록 조회
    @GetMapping("/my-mentors")
    public ResponseEntity<List<Map<String, Object>>> getMyMentors(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        try {
            // 1. 현재 로그인한 멘티 정보 조회
            Long userId = userDetails.getUserId().longValue();
            Mentee mentee = menteeRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("멘티 정보를 찾을 수 없습니다."));
            
            // 2. ACCEPTED 상태의 멘토 요청들 조회
            List<MentorRequest> acceptedRequests = mentorRequestRepository
                    .findByMenteeIdAndStatus(mentee.getMenteeId(), "ACCEPTED");
            
            // 3. 각 요청에 대해 멘토 정보 조회
            List<Map<String, Object>> mentors = acceptedRequests.stream().map(request -> {
                Mentor mentor = mentorEntityRepository.findById(request.getMentorId())
                        .orElseThrow(() -> new RuntimeException("멘토 정보를 찾을 수 없습니다."));
                
                Member member = memberRepository.findById(mentor.getUserId())
                        .orElseThrow(() -> new RuntimeException("멤버 정보를 찾을 수 없습니다."));
                
                Map<String, Object> mentorMap = new HashMap<>();
                mentorMap.put("id", mentor.getMentorId());
                mentorMap.put("name", member.getName());
                mentorMap.put("subject", mentor.getSpecialties() != null ? mentor.getSpecialties() : "");
                // 실제 평균 점수 계산 (임시로 3점으로 설정)
                mentorMap.put("rating", 3.0);
                mentorMap.put("experience", mentor.getExperienceYears() + "년");
                mentorMap.put("intro", mentor.getIntroduction() != null ? mentor.getIntroduction() : "멘토 소개가 없습니다.");
                
                return mentorMap;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(mentors);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    // 멘티 ID 조회 API 추가
    @GetMapping("/my-info")
    public ResponseEntity<Map<String, Object>> getMyInfo(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        try {
            // 1. 현재 로그인한 멘티 정보 조회
            Long userId = userDetails.getUserId().longValue();
            Mentee mentee = menteeRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("멘티 정보를 찾을 수 없습니다."));
            
            Map<String, Object> menteeInfo = new HashMap<>();
            menteeInfo.put("menteeId", mentee.getMenteeId());
            menteeInfo.put("userId", mentee.getUserId());
            menteeInfo.put("name", mentee.getName());
            menteeInfo.put("age", mentee.getAge());
            
            return ResponseEntity.ok(menteeInfo);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new HashMap<>());
        }
    }
}

