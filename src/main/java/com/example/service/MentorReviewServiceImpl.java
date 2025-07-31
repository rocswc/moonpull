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
    public List<MentorReviewVO> getReviewsByMentorId(int mentorId) {
        System.out.println("getReviewsByMentorId 호출됨 - mentor_id: " + mentorId);
        return mentorReviewDAO.getReviewsByMentorId(mentorId);
    }

    @Override
    @Transactional
    public int insertReview(MentorReviewVO vo) {
        System.out.println("insertReview 호출됨");
        System.out.println("입력된 rating: " + vo.getRating());
        System.out.println("입력된 menteeId: " + vo.getMenteeId());
        System.out.println("입력된 mentorId: " + vo.getMentorId());
        System.out.println("입력된 feedback: " + vo.getFeedback());

        int result = mentorReviewDAO.insertReview(vo);
        System.out.println("insert 결과: " + result);

        if (result > 0) {
            System.out.println("평균 평점 업데이트 시도 - mentorId: " + vo.getMentorId());
            mentorReviewDAO.updateMentorAverageScore(vo.getMentorId());
            System.out.println("평균 평점 업데이트 완료");
        } else {
            System.out.println("insert 실패");
        }

        return result;
    }
}
