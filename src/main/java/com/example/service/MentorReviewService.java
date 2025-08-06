package com.example.service;

import java.util.List;
import com.example.VO.MentorReviewVO;

public interface MentorReviewService {
    List<MentorReviewVO> getReviewsByMentorId(int mentor_id);
    Integer insertReview(MentorReviewVO vo);
    // void updateMentorAverageScore(int mentorId); 서비스 외부에서 직접 호출할 필요가 없는 내부 작업이여서 주석
}
