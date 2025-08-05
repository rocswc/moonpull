package com.example.DAO;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.VO.MemberVO;

@Mapper
public interface ChatRepository {
	 List<MemberVO> AllUsers();
}
