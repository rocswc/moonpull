package com.example.service;
import java.util.List;



import com.example.VO.MemberVO;
import com.example.VO.MentorVO;
public interface MentorService {

	
	 List<MemberVO> getAllUsers();

	    List<MemberVO> searchUsers(String keyword);

	    List<MentorVO> getAllMentorApplications();

	    void approveMentor(int userId);

	    void revokeMentor(int userId);

	    void banUser(int userId);

	    void unbanUser(int userId);

	    List<MemberVO> getBlacklistedUsers();
	    void insertMentorApplication(MentorVO mentorVO);
	    
	    void denyMentor(int userId);
}
