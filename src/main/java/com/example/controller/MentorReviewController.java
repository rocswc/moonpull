package com.example.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.VO.MentorReviewVO;
import com.example.service.MentorReviewService;

@RestController //JSON 데이터를 주고받는 REST API
@RequestMapping("/api/mentor-review")
@CrossOrigin(origins = "http://192.168.56.1:8888", allowCredentials = "true") // credentials:true 일 때는 * 안됨! 8888 오는 요청은 허용하겠다"   쿠키나 세션 같은 인증 정보도 허용
public class MentorReviewController {

    @Autowired
    private MentorReviewService mentorReviewService;

    // 멘토 ID로 리뷰 목록 조회 	@PathVariable : URL 경로에 값이 있을 때
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
