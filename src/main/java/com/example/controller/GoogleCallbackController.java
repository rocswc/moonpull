package com.example.controller;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import com.example.VO.MemberVO;
import com.example.jwt.JwtUtil;
import com.example.service.UserService;
import com.example.service.SessionService; // ★ 추가

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/auth/google")
public class GoogleCallbackController {

    @Value("${oauth.google.client-id}")     private String clientId;
    @Value("${oauth.google.client-secret}") private String clientSecret;
    @Value("${oauth.google.redirect-uri}")  private String redirectUri;

    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final SessionService sessionService; // ★ 추가

    public GoogleCallbackController(JwtUtil jwtUtil, UserService userService, SessionService sessionService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.sessionService = sessionService; // ★
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> handleGoogleCallback(@RequestParam("code") String code,
                                                     HttpServletRequest request) throws Exception { // ★ 세션 위해 추가
        // 1) code -> access_token
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        var form = new org.springframework.util.LinkedMultiValueMap<String, String>();
        form.add("code", code);
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", redirectUri);
        form.add("grant_type", "authorization_code");

        ResponseEntity<String> tokenResponse =
            restTemplate.postForEntity("https://oauth2.googleapis.com/token",
                new HttpEntity<>(form, headers), String.class);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode tokenJson = mapper.readTree(tokenResponse.getBody());
        String accessToken = tokenJson.path("access_token").asText(null);
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2) access_token -> userinfo
        HttpHeaders uiHeaders = new HttpHeaders();
        uiHeaders.setBearerAuth(accessToken);
        ResponseEntity<String> userInfoResponse = restTemplate.exchange(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            HttpMethod.GET,
            new HttpEntity<>(uiHeaders),
            String.class
        );
        JsonNode userInfo = mapper.readTree(userInfoResponse.getBody());

        final String socialType = "GOOGLE";
        final String socialId   = userInfo.path("id").asText();
        final String email      = userInfo.path("email").asText(null);

        // 3) 기존 회원: 세션 생성 + 짧은 ACCESS 토큰 발급
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
            
            // ★ 서버 세션 생성 (refresh 정보 서버측 저장)
            HttpSession httpSession = request.getSession(true);
            sessionService.create(httpSession, userId, roles, sessionVersion,
                    Duration.ofDays(14),   // refresh TTL
                    30 * 60);              // 세션 유휴만료(30분)

            // ★ 짧은 Access 토큰(10분) 발급
            String access = jwtUtil.createAccess(userId, roles, sessionVersion, Duration.ofMinutes(10));

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

        // 4) 신규 회원: 소셜가입 페이지로 리다이렉트
        String joinUrl = "https://localhost:8888/auth/social-join"
                + "?provider=" + enc(socialType)
                + "&socialId=" + enc(socialId)
                + "&email="    + enc(email);

        return ResponseEntity.status(HttpStatus.SEE_OTHER)
                .location(URI.create(joinUrl))
                .build();
    }

    private static String enc(String v) {
        return URLEncoder.encode(v == null ? "" : v, StandardCharsets.UTF_8);
    }
}
