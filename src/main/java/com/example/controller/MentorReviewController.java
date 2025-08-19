package com.example.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.VO.MentorReviewVO;
import com.example.service.MentorReviewService;
import com.example.security.CustomUserDetails;
import com.example.DAO.MenteeRepository;
import com.example.entity.Mentee;

@RestController //JSON 데이터를 주고받는 REST API
@RequestMapping("/api/mentor-review")
@CrossOrigin(origins = "http://192.168.56.1:8888", allowCredentials = "true") // credentials:true 일 때는 * 안됨! 8888 오는 요청은 허용하겠다"   쿠키나 세션 같은 인증 정보도 허용
public class MentorReviewController {

    @Autowired
    private MentorReviewService mentorReviewService;
    
    @Autowired
    private MenteeRepository menteeRepository;

    // 멘토 ID로 리뷰 목록 조회 	@PathVariable : URL 경로에 값이 있을 때
    @GetMapping("/{mentorId}")
    public List<MentorReviewVO> getReviews(@PathVariable("mentorId") int mentorId) {
        return mentorReviewService.getReviewsByMentorId(mentorId);
    }

    // 멘토별 리뷰 통계 조회 (평균점수, 리뷰개수, 평점합계)
    @GetMapping("/stats/{mentorId}")
    public Map<String, Object> getMentorReviewStats(@PathVariable("mentorId") int mentorId) {
        return mentorReviewService.getMentorReviewStats(mentorId);
    }

    // 멘토 정보 조회
    @GetMapping("/mentor/{mentorId}")
    public Map<String, Object> getMentorInfo(@PathVariable("mentorId") int mentorId) {
        return mentorReviewService.getMentorInfo(mentorId);
    }

    // 리뷰 등록 및 평균 평점 업데이트
    @PostMapping("/insert")
    public Integer insertReview(@RequestBody MentorReviewVO vo, 
                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        // 현재 로그인한 사용자의 mentee_id를 자동으로 가져와서 설정
        Long userId = userDetails.getUserId().longValue();
        Mentee mentee = menteeRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("멘티 정보를 찾을 수 없습니다. userId: " + userId));
        
        vo.setMenteeId(mentee.getMenteeId().intValue());
        
        return mentorReviewService.insertReview(vo);
    }
}
