package com.example.controller;

import java.time.Duration;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.VO.MemberVO;
import com.example.jwt.JwtUtil;
import com.example.service.UserService;
import com.example.service.SessionService; // ★ 세션 서비스

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/auth/social")
public class SocialFinalizeController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final SessionService sessionService; // ★

    public SocialFinalizeController(UserService userService, JwtUtil jwtUtil, SessionService sessionService) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.sessionService = sessionService;
    }

    @PostMapping("/finalize")
    public ResponseEntity<Void> finalizeLogin(@RequestBody SocialFinalizeReq req,
                                              HttpServletRequest request) {
        var opt = userService.getBySocialIdAndType(req.socialId(), req.provider());
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        MemberVO m = opt.get();
        Integer userId = m.getUserId();

        // roles CSV -> Set<String>
        Set<String> roles = (m.getRoles() == null || m.getRoles().isBlank())
                ? Set.of()
                : Arrays.stream(m.getRoles().split(","))
                        .map(String::trim).filter(s -> !s.isEmpty())
                        .collect(Collectors.toSet());

        int sessionVersion = (m.getSessionVersion() == null) ? 0 : m.getSessionVersion();

        // ★ 서버 세션 생성 (refresh 정보 서버측 보관)
        HttpSession httpSession = request.getSession(true);
        sessionService.create(
                httpSession,
                userId,
                roles,
                sessionVersion,
                Duration.ofDays(14),   // refresh TTL
                30 * 60                // 세션 유휴 만료(30분)
        );

        // ★ 짧은 Access 발급 (10분 권장)
        String access = jwtUtil.createAccess(userId, roles, sessionVersion, Duration.ofMinutes(10));

        // ★ 교차 도메인 → SameSite=None; Secure
        ResponseCookie cookie = ResponseCookie.from("jwt", access)
        		.httpOnly(true)
                .secure(true)              // 로컬에서 https면 true 유지
                .sameSite("None")           // ← 여기 Lax
                .path("/")
                .maxAge(Duration.ofMinutes(10))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    public record SocialFinalizeReq(String provider, String socialId, String state) {}
}
