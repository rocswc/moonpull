package com.example.service;

import java.util.List;
import com.example.VO.MentorReviewVO;

public interface MentorReviewService {
    List<MentorReviewVO> getReviewsByMentorId(int mentor_id);
    Integer insertReview(MentorReviewVO vo);
}
