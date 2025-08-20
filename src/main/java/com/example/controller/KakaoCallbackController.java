package com.example.controller;

import java.io.Serializable;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.VO.MemberVO;
import com.example.dto.KakaoUserDTO;
import com.example.jwt.JwtUtil;
import com.example.service.KakaoService;
import com.example.service.SessionService;
import com.example.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
public class KakaoCallbackController {

    private final KakaoService kakaoService;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final SessionService sessionService;

    // ✅ 프론트 베이스 URL 환경설정 사용 (없으면 기본값 사용)
    @Value("${app.frontend-base-url:https://localhost:8888}")
    private String frontendBaseUrl;

    public KakaoCallbackController(KakaoService kakaoService,
                                   UserService userService,
                                   JwtUtil jwtUtil,
                                   SessionService sessionService) {
        this.kakaoService = kakaoService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.sessionService = sessionService;
    }

    @GetMapping("/auth/kakao/callback")
    public ResponseEntity<Void> kakaoCallback(@RequestParam String code,
                                              HttpServletRequest request) {
        try {
            String kakaoAccessToken = kakaoService.getAccessToken(code);
            KakaoUserDTO userInfo = kakaoService.getUserInfo(kakaoAccessToken);

            final String socialType = "KAKAO";
            final String socialId   = String.valueOf(userInfo.getId());
            final String email      = (userInfo.getKakaoAccount() != null)
                                        ? userInfo.getKakaoAccount().getEmail()
                                        : null;

            // 1) 이미 카카오로 연동된 회원 → 즉시 로그인
            if (userService.existsBySocialIdAndType(socialId, socialType)) {
                MemberVO m = userService.getBySocialIdAndType(socialId, socialType).orElseThrow();

                Integer userId = m.getUserId();
                Set<String> roles = (m.getRoles() == null || m.getRoles().isBlank())
                        ? Set.of()
                        : Arrays.stream(m.getRoles().split(","))
                                .map(String::trim)
                                .filter(s -> !s.isEmpty())
                                .collect(Collectors.toSet());
                int sessionVersion = (m.getSessionVersion() == null) ? 0 : m.getSessionVersion();

                // 서버 세션 생성 (refresh는 서버측 관리)
                HttpSession httpSession = request.getSession(true);
                sessionService.create(httpSession, userId, roles, sessionVersion,
                        Duration.ofDays(14),   // refresh TTL
                        30 * 60);              // 세션 유휴만료(30분)

                // 짧은 Access(10분) 발급
                String access = jwtUtil.createAccess(userId, roles, sessionVersion, Duration.ofMinutes(10));

                ResponseCookie cookie = ResponseCookie.from("jwt", access)
                        .httpOnly(true)
                        .secure(true)
                        .sameSite("None")
                        .path("/")
                        .maxAge(10 * 60)
                        .build();

                return ResponseEntity.status(HttpStatus.SEE_OTHER)
                        .header(HttpHeaders.SET_COOKIE, cookie.toString())
                        .location(URI.create(frontendBaseUrl + "/"))
                        .build();
            }

         // 2) 같은 이메일의 "일반 계정" 존재 → 세션대신 링크토큰(JWT)으로 연동 동의
            if (email != null) {
                MemberVO existingByEmail = userService.getByEmail(email).orElse(null);
                if (existingByEmail != null && existingByEmail.getSocialId() == null) {

                    // ▶ 10분짜리 링크 토큰 발급 (subject=memberId, roles 빈값, ver=0)
                    String linkToken = jwtUtil.createAccess(
                        existingByEmail.getUserId(),
                        java.util.Collections.emptySet(),
                        0,
                        java.time.Duration.ofMinutes(10)
                    );

                    // ▶ 프론트 연동동의 페이지로: provider/email/socialId/token 전달
                    String linkUrl = frontendBaseUrl + "/auth/link"
                        + "?provider=" + enc(socialType)
                        + "&email="    + enc(email)
                        + "&socialId=" + enc(socialId)
                        + "&token="    + enc(linkToken);

                    return ResponseEntity.status(HttpStatus.SEE_OTHER)
                            .location(URI.create(linkUrl))
                            .build();
                }
            }

            // 3) 신규 회원 → 소셜가입 페이지로
            String joinUrl = frontendBaseUrl + "/auth/social-join"
                    + "?provider=" + enc(socialType)
                    + "&socialId=" + enc(socialId)
                    + "&email="    + enc(email);

            return ResponseEntity.status(HttpStatus.SEE_OTHER)
                    .location(URI.create(joinUrl))
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private static String enc(String v) {
        return URLEncoder.encode(v == null ? "" : v, StandardCharsets.UTF_8);
    }

    // 세션에 보관할 연동 대기 정보 (직렬화 + Integer 초단위)
    public static class PendingLink implements Serializable {
        private static final long serialVersionUID = 1L;

        private final Integer memberId;
        private final String  socialType;
        private final String  socialId;
        private final String  email;
        private final Integer expiresAtSec; // 초 단위

        public PendingLink(Integer memberId, String socialType, String socialId, String email, Integer expiresAtSec) {
            this.memberId = memberId;
            this.socialType = socialType;
            this.socialId = socialId;
            this.email = email;
            this.expiresAtSec = expiresAtSec;
        }

        public Integer getMemberId()    { return memberId; }
        public String  getSocialType()  { return socialType; }
        public String  getSocialId()    { return socialId; }
        public String  getEmail()       { return email; }
        public Integer getExpiresAtSec(){ return expiresAtSec; }

        public boolean isExpired() {
            return (System.currentTimeMillis() / 1000) > expiresAtSec;
        }
    }
}
