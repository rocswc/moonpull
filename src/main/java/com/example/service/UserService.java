package com.example.service;

import com.example.VO.MemberVO;
import com.example.dto.SocialUserDTO;

import java.util.Optional;
import java.util.Set;

public interface UserService {

    // 존재 여부
    boolean existsBySocialIdAndType(String socialId, String socialType);

    // 조회
    Optional<MemberVO> getBySocialIdAndType(String socialId, String socialType);
    Optional<MemberVO> getByEmail(String email);
    Optional<MemberVO> getById(Integer id);

    // 소셜 회원 처리(필요하면 유지)
    void processKakaoLogin(SocialUserDTO userInfo);

    // 유틸
    Set<String> parseRoles(String rolesCsv);
    boolean matchesPassword(String raw, String hash);
    
    // DB에 해당 전화번호가 존재하는지 
    boolean existsByPhone(String phone);
    
}
