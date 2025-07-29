package com.example.service;

import java.util.List;

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
    @Transactional
    public Integer insertReview(MentorReviewVO vo) {
        int result = mentorReviewDAO.insertReview(vo);
        mentorReviewDAO.updateMentorAverageScore(vo.getMentorId());
        return result;
    }
}
