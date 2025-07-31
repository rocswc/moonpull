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

@RestController
@RequestMapping("/api")
public class AuthController {

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
            "roles", roles,
            "nickname", user.getUserEntity().getNickname()    // MemberVO에서 닉네임 가져옴
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse res) {
        // 기본 쿠키 객체
        Cookie cookie = new Cookie("jwt", "");
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0); // 즉시 만료

        // 로컬 HTTP 개발환경: Secure=false, 배포 HTTPS: Secure=true 권장
        cookie.setSecure(false); // 필요시 true 로 변경

        res.addCookie(cookie);

        // SameSite 설정(서블릿 API에 직접 속성이 없어 헤더로 한 번 더 명시)
        // 크로스사이트에서 쿠키 쓰려면 SameSite=None; Secure 필요
        res.addHeader("Set-Cookie",
            "jwt=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");

        return ResponseEntity.ok().build();
    }
}
