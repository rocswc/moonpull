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
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.VO.MemberVO;
import com.example.jwt.JwtUtil;
import com.example.service.SessionService;
import com.example.service.UserService;
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

    @Value("${app.frontend-base-url:https://localhost:8888}")
    private String frontendBaseUrl;

    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final SessionService sessionService;

    public GoogleCallbackController(JwtUtil jwtUtil, UserService userService, SessionService sessionService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.sessionService = sessionService;
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> handleGoogleCallback(
        @RequestParam(required = false) String code,
        @RequestParam(required = false) String state,
        @RequestParam(required = false) String error,
        @RequestParam(name = "error_description", required = false) String errorDescription,
        HttpServletRequest request
    ) throws Exception {

        // 실패 처리
        if (error != null || code == null || code.isBlank()) {
            String url = frontendBaseUrl
                + "/auth/login?oauth=google"
                + "&status=" + (error != null ? "error" : "cancelled")
                + (error != null ? "&error=" + enc(error) : "")
                + (errorDescription != null ? "&desc=" + enc(errorDescription) : "");
            return ResponseEntity.status(303).location(URI.create(url)).build();
        }

        // 1) code → access_token
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        var form = new org.springframework.util.LinkedMultiValueMap<String, String>();
        form.add("code", code);
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", redirectUri);
        form.add("grant_type", "authorization_code");

        ResponseEntity<String> tokenResponse = restTemplate.postForEntity(
            "https://oauth2.googleapis.com/token", new HttpEntity<>(form, headers), String.class
        );

        ObjectMapper mapper = new ObjectMapper();
        JsonNode tokenJson = mapper.readTree(tokenResponse.getBody());
        String accessToken = tokenJson.path("access_token").asText(null);
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2) access_token → user info
        HttpHeaders uiHeaders = new HttpHeaders();
        uiHeaders.setBearerAuth(accessToken);
        ResponseEntity<String> userInfoResponse = restTemplate.exchange(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            HttpMethod.GET, new HttpEntity<>(uiHeaders), String.class
        );
        JsonNode userInfo = mapper.readTree(userInfoResponse.getBody());

        final String socialType = "GOOGLE";
        final String socialId = userInfo.path("id").asText();
        final String email = userInfo.path("email").asText(null);

        // 3) 이미 연동된 사용자
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

            // ✅ 세션 생성
            HttpSession httpSession = request.getSession(true);
            sessionService.create(httpSession, userId, roles, sessionVersion,
                    Duration.ofDays(14), 30 * 60); // 14일 + 유휴 30분

            // ✅ JWT 생성
            String jwt = jwtUtil.createAccess(userId, roles, sessionVersion, Duration.ofMinutes(10));

            // ✅ jwt 쿠키
            ResponseCookie jwtCookie = ResponseCookie.from("jwt", jwt)
                    .httpOnly(true).secure(true).sameSite("None")
                    .path("/").maxAge(10 * 60).build();

           

            return ResponseEntity.status(HttpStatus.SEE_OTHER)
                    .header(HttpHeaders.SET_COOKIE, jwtCookie.toString()) // ✅ jwt만 남김
                    .location(URI.create(frontendBaseUrl + "/"))
                    .build();
        }

        // 4) 이메일만 있는 기존 사용자 → 연동
        if (email != null) {
            MemberVO existingByEmail = userService.getByEmail(email).orElse(null);
            if (existingByEmail != null && existingByEmail.getSocialId() == null) {
                String linkToken = jwtUtil.createAccess(
                        existingByEmail.getUserId(), Set.of(), 0, Duration.ofMinutes(10));

                String linkUrl = frontendBaseUrl + "/auth/link"
                        + "?provider=" + enc(socialType)
                        + "&email=" + enc(email)
                        + "&socialId=" + enc(socialId)
                        + "&token=" + enc(linkToken);

                return ResponseEntity.status(HttpStatus.SEE_OTHER)
                        .location(URI.create(linkUrl))
                        .build();
            }
        }

        // 5) 신규 가입
        String joinUrl = frontendBaseUrl + "/auth/social-join"
                + "?provider=" + enc(socialType)
                + "&socialId=" + enc(socialId)
                + "&email=" + enc(email);

        return ResponseEntity.status(HttpStatus.SEE_OTHER)
                .location(URI.create(joinUrl))
                .build();
    }

    private static String enc(String v) {
        return URLEncoder.encode(v == null ? "" : v, StandardCharsets.UTF_8);
    }

    public static class PendingLink implements Serializable {
        private static final long serialVersionUID = 1L;
        private final Integer memberId;
        private final String socialType;
        private final String socialId;
        private final String email;
        private final Integer expiresAtSec;

        public PendingLink(Integer memberId, String socialType, String socialId, String email, Integer expiresAtSec) {
            this.memberId = memberId;
            this.socialType = socialType;
            this.socialId = socialId;
            this.email = email;
            this.expiresAtSec = expiresAtSec;
        }

        public Integer getMemberId() { return memberId; }
        public String getSocialType() { return socialType; }
        public String getSocialId() { return socialId; }
        public String getEmail() { return email; }
        public Integer getExpiresAtSec() { return expiresAtSec; }

        public boolean isExpired() {
            return (System.currentTimeMillis() / 1000) > expiresAtSec;
        }
    }
}
