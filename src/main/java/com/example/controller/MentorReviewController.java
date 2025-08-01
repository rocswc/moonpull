package com.example.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.VO.MentorReviewVO;
import com.example.service.MentorReviewService;

@RestController
@RequestMapping("/api/mentor-review")
@CrossOrigin(origins = "*") // 모든 오리진 허용 (테스트용)
public class MentorReviewController {

    @Autowired
    private MentorReviewService mentorReviewService;

    // 멘토 ID로 리뷰 목록 조회
    @GetMapping("/{mentorId}")
    public List<MentorReviewVO> getReviews(@PathVariable("mentorId") int mentorId) {
        return mentorReviewService.getReviewsByMentorId(mentorId);
    }

    // 리뷰 등록 및 평균 평점 업데이트
    @PostMapping("/insert")
    public Integer insertReview(@RequestBody MentorReviewVO vo) {
        return mentorReviewService.insertReview(vo);
    }
}
