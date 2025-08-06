package com.example.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import com.example.security.CustomUserDetails;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

// 인증 관련 API 컨트롤러
@RestController
@RequestMapping("/api")
public class AuthController {

    // 로그인한 사용자 정보 조회용 API (JWT 검증 통과 후 호출됨)
    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        // 인증 객체가 없거나 인증되지 않았을 경우
        if (authentication == null || !authentication.isAuthenticated()) {
            return Map.of("authenticated", false);
        }

        // JWT로부터 사용자 정보 추출
        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();

        // 권한 목록 추출 (ex: ROLE_USER, ROLE_ADMIN 등)
        List<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        // 클라이언트에 사용자 정보 및 인증 여부 반환
        return Map.of(
            "authenticated", true,
            "loginId", user.getUsername(),                        // 사용자 ID
            "roles", roles,                                       // 사용자 권한 목록
            "nickname", user.getMemberVO().getNickname()          // 사용자 닉네임
        );
    }

    // 로그아웃 API (쿠키 삭제)
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse res) {
        // jwt 쿠키를 삭제하기 위한 빈 쿠키 생성
        Cookie cookie = new Cookie("jwt", "");
        cookie.setPath("/");              // 전체 경로에 대해 적용
        cookie.setHttpOnly(true);         // JS 접근 차단
        cookie.setSecure(false);          // HTTPS 사용 시 true
        cookie.setMaxAge(0);              // 즉시 만료

        // 응답에 쿠키 포함
        res.addCookie(cookie);

        // SameSite 속성까지 포함한 명시적 쿠키 삭제
        res.addHeader("Set-Cookie",
            "jwt=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");

        // 200 OK 응답
        return ResponseEntity.ok().build();
    }
}
