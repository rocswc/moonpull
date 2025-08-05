package com.example.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.DAO.ChatRepository;
import com.example.DAO.MentorRepository;
import com.example.VO.MemberVO;

@RestController
public class ChatuserController {
	@Autowired
	private ChatRepository chatRepository;
	  
	   
	@GetMapping("/users/all")
	public List<MemberVO> getAllUsersNoCondition() {
	    return chatRepository.AllUsers();
	}  
	
}
