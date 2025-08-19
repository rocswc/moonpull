package com.example.service;

import com.example.VO.MemberVO;
import com.example.dto.SocialLinkDTO;
import com.example.dto.SocialLinkResponse;

public interface SocialLinkService {
    SocialLinkResponse link(SocialLinkDTO dto);
    
   
 // 신규(토큰 기반) 👇
    MemberVO verifyPasswordAndLink(Integer memberId, String provider, String socialId, String rawPassword);
}
