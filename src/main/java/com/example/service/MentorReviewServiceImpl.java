package com.example.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.DAO.MentorReviewDAO;
import com.example.VO.MentorReviewVO;

@Service
public class MentorReviewServiceImpl implements MentorReviewService {

    @Autowired
    private MentorReviewDAO mentorReviewDAO;

    
    @Override
    public List<MentorReviewVO> getReviewsByMentorId(int mentor_id) {
        return mentorReviewDAO.getReviewsByMentorId(mentor_id);
    }

    @Override
    @Transactional //하나라도 실패하면 전부 롤백되도록 보장 (리뷰 저장, 멘토의 평균 평점 업데이트)
    public Integer insertReview(MentorReviewVO vo) {
        int result = mentorReviewDAO.insertReview(vo);
        mentorReviewDAO.updateMentorAverageScore(vo.getMentorId());
        return result;
    }

    @Override
    public Map<String, Object> getMentorReviewStats(int mentorId) {
        return mentorReviewDAO.getMentorReviewStats(mentorId);
    }

    @Override
    public Map<String, Object> getMentorInfo(int mentorId) {
        return mentorReviewDAO.getMentorInfo(mentorId);
    }
}
