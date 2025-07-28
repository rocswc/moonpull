package com.example.service;

import com.example.dto.JoinDTO;

public interface JoinService {
    // 회원가입 처리 로직을 담당하는 메서드 (구현체에서 실제 로직 정의)
    void joinProcess(JoinDTO joinDTO);
}
