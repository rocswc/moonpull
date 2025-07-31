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
            "nickname", user.getMemberVO().getNickname()    // MemberVO에서 닉네임 가져옴
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse res) {
        // 쿠키 삭제용 쿠키 생성 (로그인과 동일한 속성)
        Cookie cookie = new Cookie("jwt", "");
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // HTTPS 환경이면 true로 변경
        cookie.setMaxAge(0); // 즉시 만료

        // 쿠키 추가
        res.addCookie(cookie);

        // SameSite 속성까지 명시적으로 삭제
        res.addHeader("Set-Cookie",
            "jwt=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");

        return ResponseEntity.ok().build();
    }
}
