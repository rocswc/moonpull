package com.example.controller;

import com.example.VO.MemberVO;
import com.example.dto.JoinDTO;
import com.example.jwt.JwtUtil;
import com.example.service.JoinService;
import com.example.DAO.UserRepository;


import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class SocialJoinController {

    @Autowired private JoinService joinService;
    @Autowired private UserRepository userRepository;          
  
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/api/social-join")
    public ResponseEntity<?> socialJoin(@ModelAttribute JoinDTO joinDTO, HttpServletResponse response) {
        // 1. 회원가입 처리
        joinService.joinProcess(joinDTO);

        // 2. 가입된 사용자 조회 (member 테이블에서 직접 조회)
        MemberVO user = userRepository
            .findBySocialTypeAndSocialId(joinDTO.getSocialType(), joinDTO.getSocialId())
            .orElseThrow(() -> new RuntimeException("회원가입 후 사용자 조회 실패"));

        // 3. JWT 생성
        String token = jwtUtil.createJwt(
            joinDTO.getSocialId(),
            user.getNickname(),
            user.getRoles(),
            1000L * 60 * 60 * 24
        );

        // 4. JWT를 쿠키로 전달
        response.setHeader("Set-Cookie", String.format(
            "jwt=%s; Path=/; Max-Age=%d; HttpOnly; Secure; SameSite=None",
            token, 60 * 60 * 24
        ));

        return ResponseEntity.ok("소셜 회원가입 + 로그인 완료");
    }

}
