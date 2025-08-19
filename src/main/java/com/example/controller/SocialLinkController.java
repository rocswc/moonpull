package com.example.controller;

import java.net.URI;
import java.time.Duration;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.VO.MemberVO;
import com.example.dto.SocialLinkResponse;
import com.example.jwt.JwtUtil;
import com.example.service.SessionService;
import com.example.service.SocialLinkService;
import com.example.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
public class SocialLinkController {

    private final SocialLinkService linkService;
    private final UserService userService;
    private final SessionService sessionService;
    private final JwtUtil jwtUtil;

    @Value("${app.frontend-base-url:https://localhost:8888}")
    private String frontendBaseUrl;

    public SocialLinkController(SocialLinkService linkService,
                                UserService userService,
                                SessionService sessionService,
                                JwtUtil jwtUtil) {
        this.linkService = linkService;
        this.userService = userService;
        this.sessionService = sessionService;
        this.jwtUtil = jwtUtil;
    }

    // ✅ 토큰 방식: 쿼리로 provider/socialId/token, 바디로 password
    @PostMapping("/social-link/verify-password")
    public ResponseEntity<?> verifyAndLink(
            @RequestParam("provider") String provider,
            @RequestParam("socialId") String socialId,
            @RequestParam("token") String token,
            @RequestBody Map<String, String> body,
            HttpServletRequest request
    ) {
        String password = body == null ? null : body.get("password");
        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(new SocialLinkResponse(false, "비밀번호 필요"));
        }

        // 1) 링크 토큰 검증 (만료/위조)
        if (jwtUtil.isExpired(token)) {
            return ResponseEntity.status(410).body(new SocialLinkResponse(false, "연동 토큰 만료"));
        }
        String sub = jwtUtil.getSubject(token); // subject = memberId
        if (sub == null) {
            return ResponseEntity.status(401).body(new SocialLinkResponse(false, "토큰 무효"));
        }
        final Integer memberId;
        try {
            memberId = Integer.valueOf(sub);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(401).body(new SocialLinkResponse(false, "토큰 subject 오류"));
        }

        // 2) 비밀번호 검증 + 멱등 연동
        final MemberVO member;
        try {
            member = linkService.verifyPasswordAndLink(memberId, provider, socialId, password);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(new SocialLinkResponse(false, "인증 실패"));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(new SocialLinkResponse(false, e.getMessage()));
        }

        // 3) 로그인 처리 (세션 + 10분 액세스)
        Set<String> roles = userService.parseRoles(member.getRoles());
        int sessionVersion = member.getSessionVersion() == null ? 0 : member.getSessionVersion();

        HttpSession httpSession = request.getSession(true);
        sessionService.create(
                httpSession,
                member.getUserId(),
                roles,
                sessionVersion,
                Duration.ofDays(14),
                30 * 60 // idle timeout
        );

        String access = jwtUtil.createAccess(member.getUserId(), roles, sessionVersion, Duration.ofMinutes(10));
        ResponseCookie cookie = ResponseCookie.from("jwt", access)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(10 * 60)
                .build();

        // 👇 200 OK + JSON + Set-Cookie (리다이렉트 금지)
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new SocialLinkResponse(true, "연동 완료"));  // { success: true, message: ... }
    }
}
