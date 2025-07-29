package com.example.service;

import org.springframework.web.multipart.MultipartFile;

import com.example.dto.JoinDTO;

public interface JoinService {
    // 회원가입 처리 로직을 담당하는 메서드 (구현체에서 실제 로직 정의)
    void joinProcess(JoinDTO joinDTO);
    
    // 단독 파일 업로드 처리용 메서드 선언
    void saveFile(MultipartFile file);
}
