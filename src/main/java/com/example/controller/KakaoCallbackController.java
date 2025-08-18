package com.example.controller;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

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
import com.example.service.SessionService; // ★ 추가
import com.example.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
public class KakaoCallbackController {

    private final KakaoService kakaoService;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final SessionService sessionService; // ★ 추가

    public KakaoCallbackController(KakaoService kakaoService,
                                   UserService userService,
                                   JwtUtil jwtUtil,
                                   SessionService sessionService) { // ★ 주입
        this.kakaoService = kakaoService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.sessionService = sessionService;
    }

    @GetMapping("/auth/kakao/callback")
    public ResponseEntity<Void> kakaoCallback(@RequestParam String code,
                                              HttpServletRequest request) { // ★ 세션 생성 위해 추가
        try {
            String kakaoAccessToken = kakaoService.getAccessToken(code);
            KakaoUserDTO userInfo = kakaoService.getUserInfo(kakaoAccessToken);

            final String socialType = "KAKAO";
            final String socialId   = String.valueOf(userInfo.getId());
            final String email      = (userInfo.getKakaoAccount()!=null) ? userInfo.getKakaoAccount().getEmail() : null;

            // 기존 회원: 세션 생성 + 짧은 Access 발급 + 쿠키 심고 홈으로 리다이렉트
            if (userService.existsBySocialIdAndType(socialId, socialType)) {
                MemberVO m = userService.getBySocialIdAndType(socialId, socialType).orElseThrow();

                Integer userId = m.getUserId();
                // roles: "MENTEE,ADMIN" 와 같이 CSV라면 Set으로 변환
                Set<String> roles = (m.getRoles() == null || m.getRoles().isBlank())
                        ? Set.of()
                        : Arrays.stream(m.getRoles().split(","))
                                .map(String::trim)
                                .filter(s -> !s.isEmpty())
                                .collect(Collectors.toSet());
                int sessionVersion = (m.getSessionVersion() == null) ? 0 : m.getSessionVersion();

                // ★ 서버 세션 생성 (refresh 정보는 SessionService 내부에서 관리)
                HttpSession httpSession = request.getSession(true);
                sessionService.create(
                        httpSession,
                        userId,
                        roles,
                        sessionVersion,
                        Duration.ofDays(14),   // refresh TTL (서버측)
                        30 * 60                // 세션 유휴만료(30분) 필요시 properties로 이동
                );

                // ★ 짧은 Access(예: 10분) 발급
                String access = jwtUtil.createAccess(userId, roles, sessionVersion, Duration.ofMinutes(10));

                // ★ 프론트 도메인이 다르므로 SameSite=None + Secure=true
             // ★ 교차 도메인 → SameSite=None; Secure
                ResponseCookie cookie = ResponseCookie.from("jwt", access)
                        .httpOnly(true)
                        .secure(true)
                        .sameSite("None")
                        .path("/")
                        .maxAge(10 * 60)
                        .build();

                return ResponseEntity.status(HttpStatus.SEE_OTHER)
                        .header(HttpHeaders.SET_COOKIE, cookie.toString())
                        .location(URI.create("https://localhost:8888/"))
                        .build();
            }

            // 신규 회원: 소셜 가입 페이지로 이동 (name 제거)
            String joinUrl = "https://localhost:8888/auth/social-join"
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
}
