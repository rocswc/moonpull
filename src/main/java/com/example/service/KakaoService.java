package com.example.service;

import com.example.dto.SocialUserDTO;

public interface KakaoService {
    String getAccessToken(String code) throws Exception;

    // 원래 KakaoUserDTO 반환하던 getUserInfo 제거하고
    // 바로 SocialUserDTO를 리턴하도록 수정
    SocialUserDTO getUser(String accessToken) throws Exception;
}
