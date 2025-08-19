package com.example.DAO;

import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;
import com.example.VO.MentorReviewVO;

@Mapper
public interface MentorReviewDAO {
    List<MentorReviewVO> getReviewsByMentorId(int mentorId);
    int insertReview(MentorReviewVO vo); // 여기서 vo가 없으면 int rating, int menteeId,.. 
    void updateMentorAverageScore(int mentorId);
    Map<String, Object> getMentorReviewStats(int mentorId); // ✅ 멘토별 리뷰 통계 조회
    Map<String, Object> getMentorInfo(int mentorId); // ✅ 멘토 정보 조회
}
