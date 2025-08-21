package com.example.controller;

import java.time.Duration;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
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

    public static class TokenReq { public String token; }

    @PostMapping("/finalize-cookie")
    public ResponseEntity<Void> finalizeCookie(@RequestBody TokenReq req) {
        if (req == null || req.token == null || req.token.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // 1) one-time 토큰 검증 → 사용자 복원
        MemberVO m = jwtUtil.verifyOneTimeExchangeToken(req.token);

        // 2) 실제 로그인용 JWT 발급 (원래 쓰던 generateToken)
        String jwt = jwtUtil.generateToken(m);

        // 3) 여기 "호스트=192.168.56.1"로 호출되므로 여기서 쿠키 심으면 됨
        ResponseCookie cookie = ResponseCookie.from("jwt", jwt)
                // domain() 절대 넣지 마세요 (host-only cookie)
                .httpOnly(true)
                .secure(true)       // SameSite=None을 쓰려면 HTTPS 필수
                .sameSite("None")
                .path("/")
                .maxAge(Duration.ofDays(7))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }
}
