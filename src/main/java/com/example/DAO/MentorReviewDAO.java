package com.example.DAO;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import com.example.VO.MentorReviewVO;

@Mapper
public interface MentorReviewDAO {
    List<MentorReviewVO> getReviewsByMentorId(int mentorId);
    int insertReview(MentorReviewVO vo); // 여기서 vo가 없으면 int rating, int menteeId,.. 
    void updateMentorAverageScore(int mentorId);
}
