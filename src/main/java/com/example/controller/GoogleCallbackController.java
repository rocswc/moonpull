package com.example.controller;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import com.example.VO.MemberVO;
import com.example.jwt.JwtUtil;
import com.example.service.UserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/auth/google")
public class GoogleCallbackController {

    @Value("${oauth.google.client-id}")     private String clientId;
    @Value("${oauth.google.client-secret}") private String clientSecret;
    @Value("${oauth.google.redirect-uri}")  private String redirectUri;

    private final JwtUtil jwtUtil;
    private final UserService userService;

    public GoogleCallbackController(JwtUtil jwtUtil, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> handleGoogleCallback(@RequestParam("code") String code) throws Exception {
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
        final String name       = userInfo.path("name").asText(null);

        // 3) 기존 회원: JWT 쿠키 심고 홈으로 리다이렉트
        if (userService.existsBySocialIdAndType(socialId, socialType)) {
            MemberVO m = userService.getBySocialIdAndType(socialId, socialType)
                                    .orElseThrow(); // 존재 확인했으므로 안전

            // ★ sub = 우리 DB PK 로 발급되도록 generateToken 구현
            String jwt = jwtUtil.generateToken(m);

            ResponseCookie cookie = ResponseCookie.from("jwt", jwt)
                .httpOnly(true)
                .secure(true)      // SameSite=None이면 HTTPS 필수
                .sameSite("None")
                .path("/")
                .maxAge(60L * 60 * 24 * 7)
                .build();

            return ResponseEntity.status(HttpStatus.SEE_OTHER) // 303 권장
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .location(URI.create("https://localhost:8888/"))
                .build();
        }

        // 4) 신규 회원: 소셜가입 페이지로 리다이렉트 (쿠키 없음)
        String joinUrl = "https://localhost:8888/auth/social-join"
            + "?provider=" + enc(socialType)
            + "&socialId=" + enc(socialId)
            + "&email="    + enc(email)
            + "&name="     + enc(name);

        return ResponseEntity.status(HttpStatus.SEE_OTHER)
            .location(URI.create(joinUrl))
            .build();
    }

    private static String enc(String v) {
        return URLEncoder.encode(v == null ? "" : v, StandardCharsets.UTF_8);
    }
}
