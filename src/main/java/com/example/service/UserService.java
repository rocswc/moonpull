package com.example.service;

import java.util.Optional;

import com.example.VO.MemberVO;
import com.example.dto.KakaoUserDTO;

public interface UserService {
    boolean existsBySocialIdAndType(String socialId, String socialType);
    MemberVO findBySocialIdAndType(String socialId, String socialType);
    void processKakaoLogin(KakaoUserDTO userInfo);
    
    
    Optional<MemberVO> getBySocial(String socialType, String socialId);
    
}
