package com.example.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.VO.MentorReviewVO;
import com.example.service.MentorReviewService;

@RestController
@RequestMapping("/mentorReview")
@CrossOrigin(origins = "*") // 모든 출처 허용 (개발 환경용)
public class MentorReviewController {

    @Autowired
    private MentorReviewService mentorReviewService;

    // 테스트용 엔드포인트
    @GetMapping("/test")
    public String test() {
        return "컨트롤러 작동 OK";
    }

    // 멘토 ID로 리뷰 목록 조회
    @GetMapping("/{mentorId}")
    public ResponseEntity<List<MentorReviewVO>> getReviews(@PathVariable("mentorId") int mentorId) {
        List<MentorReviewVO> reviews = mentorReviewService.getReviewsByMentorId(mentorId);
        return ResponseEntity.ok(reviews);
    }

    // 리뷰 등록
    @PostMapping("/insert")
    public ResponseEntity<String> insertReview(@RequestBody MentorReviewVO vo) {
        System.out.println("리뷰 등록 요청 도착: " + vo); // 디버깅 로그

        int result = mentorReviewService.insertReview(vo);

        if (result > 0) {
            return ResponseEntity.ok("리뷰 등록 성공");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("리뷰 등록 실패");
        }
    }
}
