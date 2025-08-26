package com.example.service;
import java.util.List;
import com.example.VO.WrongAnswerVO;
import com.example.dto.WrongAnswerCreateRequestDTO;

public interface WrongAnswerService {
	 public WrongAnswerVO saveIfWrong(WrongAnswerCreateRequestDTO req);
	 public List<WrongAnswerVO> saveWrongBatch(List<WrongAnswerCreateRequestDTO> requests);
	 List<WrongAnswerVO> list(Long userId, String subject);
	 // ✅ 오답 해결(soft-resolve)
	 void markCorrect(String id, boolean correct); // correct=true면 해결, false면 다시 활성화
}