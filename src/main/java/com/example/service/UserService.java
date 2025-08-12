package com.example.service;

import java.util.Optional;

import com.example.VO.MemberVO;
import com.example.dto.KakaoUserDTO;

public interface UserService {

    // 존재 여부
    boolean existsBySocialIdAndType(String socialId, String socialType);

    // 조회 (Optional 권장)
    Optional<MemberVO> getBySocialIdAndType(String socialId, String socialType);

    // 소셜 회원 처리(카카오 등)
    void processKakaoLogin(KakaoUserDTO userInfo);
}
