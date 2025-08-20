package com.example.service;

import java.util.List;

import com.example.VO.WrongAnswerVO;
import com.example.dto.WrongAnswerCreateRequestDTO;

public interface WrongAnswerService {
	 public WrongAnswerVO saveIfWrong(WrongAnswerCreateRequestDTO req); 
	 public List<WrongAnswerVO> saveWrongBatch(List<WrongAnswerCreateRequestDTO> requests);	       
}