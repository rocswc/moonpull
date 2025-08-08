package com.example.service;

import com.example.dto.KakaoUserDTO;  // DTO 패키지 경로에 맞게 수정

public interface KakaoService {
    String getAccessToken(String code) throws Exception;
    KakaoUserDTO getUserInfo(String accessToken) throws Exception;
}