package com.example.DAO;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.VO.ChatMessage;
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
	    
	    Integer getUserIdByLoginId(@Param("loginId") String loginId);

	    // 🔎 블랙리스트 전체 조회
	    List<MemberVO> getBlacklistedUsers();
	    
	    void insertMentorApplication(MentorVO mentorVO);
	    int getUserCount();
	    int getInactiveUserCount();
	    
	    void insertChatMessage(ChatMessage message);
	    
	    Long getTotalAmount();
	    
	    int getTotalPaymentCount();
	    
	    int getSubscribedUserCount();
	    
	    double getSubscriptionConversionRate();
	    
	    List<Map<String, Object>> getDailyRevenue();
	    
	    List<Map<String, Object>> getRecentPaidUsers();
	    
	    void banUserByUserId(Integer userId);
	    
	    void banUserByUserIdWithReason(Map<String, Object> params);
	    
	    void insertBlacklistLog(Map<String, Object> logData);
	    
	    void unbanUsersWithExpiredBan();
	    
	    void unbanUserByUserId(Integer userId);
	   
}
