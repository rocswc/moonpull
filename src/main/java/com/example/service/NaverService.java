package com.example.service;

import com.example.dto.SocialUserDTO;

public interface NaverService {
    /** 네이버에서 내려준 code(+state)로 access_token 교환 */
    String getAccessToken(String code, String state) throws Exception;

    /** access_token으로 사용자 정보 조회 → 공통 DTO로 반환 */
    SocialUserDTO getUser(String accessToken) throws Exception;
}