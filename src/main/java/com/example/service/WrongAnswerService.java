package com.example.service;
import java.util.List;
import com.example.VO.WrongAnswerVO;
import com.example.dto.WrongAnswerCreateRequestDTO;

public interface WrongAnswerService {
    WrongAnswerVO saveIfWrong(WrongAnswerCreateRequestDTO req);
    List<WrongAnswerVO> saveWrongBatch(List<WrongAnswerCreateRequestDTO> reqs);
    List<WrongAnswerVO> list(Long userId, String subject);
    List<WrongAnswerVO> listAll(); // 모든 오답노트 조회 (디버깅용)
}