package com.example.DAO;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.VO.MemberVO;
import com.example.VO.MentorVO;

@Mapper
public interface MentorRepository {

	 List<MemberVO> getAllUsers();

	    // 🔍 사용자 검색 (이름 또는 이메일)
	    List<MemberVO> searchUsers(@Param("keyword") String keyword);

	    // ✅ 멘토 인증 요청 전체 조회
	    List<MentorVO> getAllMentorApplications();

	    // ✅ 멘토 승인
	    void approveMentor(@Param("userId") int userId);
	    //✅ 멘토 거절 
	    void denyMentor(@Param("userId") int userId);
	 
	    // ✅ 멘토 권한 철회
	    void revokeMentor(@Param("userId") int userId);
	    

	    // 🚫 블랙리스트 등록
	    void banUser(@Param("userId") int userId);

	    // ✅ 블랙리스트 해제
	    void unbanUser(@Param("userId") int userId);

	    // 🔎 블랙리스트 전체 조회
	    List<MemberVO> getBlacklistedUsers();
	    
	    void insertMentorApplication(MentorVO mentorVO);
	    int getUserCount();
	    int getInactiveUserCount();
}
