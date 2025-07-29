package com.example.DAO;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.VO.MentorReviewVO;

@Mapper
public interface MentorReviewDAO {
    
	// 특정 멘토의 리뷰 전체 조회
	List<MentorReviewVO> getReviewsByMentorId(@Param("mentor_id") int mentor_id);
	// 리뷰 등록 (insert)
	Integer insertReview(MentorReviewVO vo);
	// 평균 평점 계산 후 mentor 테이블에 반영
	void updateMentorAverageScore(@Param("mentorId") int mentorId);
}
