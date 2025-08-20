package com.example.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import com.example.security.CustomUserDetails;
import com.example.service.SessionService; // ★ 세션 무효화

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final SessionService sessionService;

    public AuthController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return Map.of("authenticated", false);
        }
        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
        List<String> roles = user.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority).toList();

        return Map.of(
            "authenticated", true,
            "loginId", user.getUsername(),
            "userId", user.getMemberVO().getUserId(),
            "roles", roles,
            "nickname", user.getMemberVO().getNickname()
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest req, HttpServletResponse res) {
        // 1) 서버 세션 무효화 (JDBC 세션 제거)
        sessionService.invalidate(req.getSession(false));

        // 2) jwt 쿠키 삭제
        ResponseCookie delJwt = ResponseCookie.from("jwt", "")
            .httpOnly(true)
            .secure(true)
            .sameSite("None")
            .path("/")
            .maxAge(0)
            .build();
        res.addHeader(HttpHeaders.SET_COOKIE, delJwt.toString());

        // 3) SESSION 쿠키 삭제 추가 ★★★
        ResponseCookie delSession = ResponseCookie.from("SESSION", "")
            .httpOnly(true)
            .secure(true)
            .sameSite("None") // CORS 환경이면 반드시 필요
            .path("/")
            .maxAge(0)
            .build();
        res.addHeader(HttpHeaders.SET_COOKIE, delSession.toString());

        return ResponseEntity.noContent().build();
    }
}
