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

    @Value("${oauth.google.client-id}")
    private String clientId;

    @Value("${oauth.google.client-secret}")
    private String clientSecret;

    @Value("${oauth.google.redirect-uri}")
    private String redirectUri;

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

        String socialType = "GOOGLE";
        String socialId   = userInfo.path("id").asText();
        String email      = userInfo.path("email").asText(null);
        String name       = userInfo.path("name").asText(null);

     // 3) DB에 있으면 → JWT 쿠키 심고 홈으로 302
        if (userService.existsBySocialIdAndType(socialId, socialType)) {
            MemberVO m = userService.getBySocial(socialType, socialId).orElseThrow();

            // ✅ PK가 subject로 들어가게 발급
            String jwt = jwtUtil.generateToken(m);

            // ✅ 로컬(HTTP) 기준: SameSite=Lax, Secure=false
            ResponseCookie cookie = ResponseCookie.from("jwt", jwt)
                    .httpOnly(true)
                    .sameSite("Lax")
                    .secure(false)
                    .path("/")
                    .maxAge(60L * 60 * 24 * 7) // 7일
                    .build();

            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .location(URI.create("http://localhost:8888/"))
                    .build();
        }

        // 4) 신규면 → /auth/social-join 로 302 (URL 인코딩)
        String joinUrl = "http://localhost:8888/auth/social-join"
                + "?provider=" + enc(socialType)
                + "&socialId=" + enc(socialId)
                + "&email="    + enc(email)
                + "&name="     + enc(name);

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(joinUrl))
                .build();
    }

    private static String enc(String v) {
        return URLEncoder.encode(v == null ? "" : v, StandardCharsets.UTF_8);
    }
}
