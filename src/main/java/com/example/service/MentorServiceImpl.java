package com.example.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.DAO.MentorRepository;
import com.example.VO.MemberVO;
import com.example.VO.MentorVO;

@Service
public class MentorServiceImpl implements MentorService {
	 @Autowired
    private MentorRepository mentorRepository;

   
   
	 
    @Override
    public List<MemberVO> getAllUsers() {
        return mentorRepository.getAllUsers();
    }

    @Override
    public List<MemberVO> searchUsers(String keyword) {
        return mentorRepository.searchUsers(keyword);
    }

    @Override
    public List<MentorVO> getAllMentorApplications() {
        return mentorRepository.getAllMentorApplications();
    }

    @Override
    public void approveMentor(int userId) {
        mentorRepository.approveMentor(userId);
    }

    @Override
    public void revokeMentor(int userId) {
        mentorRepository.revokeMentor(userId);
    }

    @Override
    public void banUser(int userId) {
        mentorRepository.banUser(userId);
    }

    @Override
    public void unbanUser(int userId) {
        mentorRepository.unbanUser(userId);
    }

    @Override
    public List<MemberVO> getBlacklistedUsers() {
        return mentorRepository.getBlacklistedUsers();
    }
    @Override
    public void insertMentorApplication(MentorVO mentorVO) {
        mentorRepository.insertMentorApplication(mentorVO);
    }
}
