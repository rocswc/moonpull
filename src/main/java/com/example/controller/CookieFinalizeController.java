package com.example.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.VO.MemberVO;
import com.example.jwt.JwtUtil;

@RestController
@RequestMapping("/auth")
public class CookieFinalizeController {

    private final JwtUtil jwtUtil;

    public CookieFinalizeController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    public static class TokenReq {
        public String token;
    }

    @PostMapping("/finalize-cookie")
    public ResponseEntity<Void> finalizeCookie(@RequestBody TokenReq req, HttpServletRequest request) {
        if (req == null || req.token == null || req.token.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // 1️⃣ 토큰 검증 → 사용자 복원
        MemberVO user = jwtUtil.verifyOneTimeExchangeToken(req.token);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        // 2️⃣ 세션 생성 및 속성 저장 (Spring이 알아서 SESSION 쿠키 내려줌)
        HttpSession session = request.getSession(true);
        session.setAttribute("userId", user.getUserId());

        return ResponseEntity.ok().build();
    }
}
