package com.example.controller;

import com.example.VO.MemberVO;
import com.example.VO.MemberSocialVO;                 // ⬅ 추가
import com.example.dto.JoinDTO;
import com.example.jwt.JwtUtil;
import com.example.service.JoinService;
import com.example.DAO.UserRepository;
import com.example.DAO.MemberSocialRepository;        // ⬅ 추가

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class SocialJoinController {

    @Autowired private JoinService joinService;
    @Autowired private UserRepository userRepository;             // (있어도 무방)
    @Autowired private MemberSocialRepository memberSocialRepository; // ⬅ 추가
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/api/social-join")
    public ResponseEntity<?> socialJoin(@ModelAttribute JoinDTO joinDTO, HttpServletResponse response) {
        // 1. 회원가입 처리
        joinService.joinProcess(joinDTO);

        // 2. 가입된 사용자 조회 (member_social에서 찾아서 member 꺼냄)
        MemberSocialVO link = memberSocialRepository
                .findBySocialTypeAndSocialId(joinDTO.getSocialType(), joinDTO.getSocialId())  // ⬅ 변경
                .orElseThrow(() -> new RuntimeException("회원가입 후 사용자 조회 실패"));

        MemberVO user = link.getMember(); // 가입된 MemberVO

        // 3. JWT 생성 (username 대체: 소셜ID 사용)
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
