package com.example.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("/auth/google")
public class GoogleCallbackController {

    @Value("${oauth.google.client-id}")
    private String clientId;

    @Value("${oauth.google.client-secret}")
    private String clientSecret;

    @Value("${oauth.google.redirect-uri}")
    private String redirectUri;

    @GetMapping("/callback")
    public RedirectView handleGoogleCallback(@RequestParam("code") String code) throws Exception {
        // 1. Google access_token 요청
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String tokenRequestBody = "code=" + code +
                "&client_id=" + clientId +
                "&client_secret=" + clientSecret +
                "&redirect_uri=" + redirectUri +
                "&grant_type=authorization_code";

        HttpEntity<String> tokenRequest = new HttpEntity<>(tokenRequestBody, headers);
        ResponseEntity<String> tokenResponse = restTemplate.postForEntity(
                "https://oauth2.googleapis.com/token", tokenRequest, String.class);

        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode tokenJson = objectMapper.readTree(tokenResponse.getBody());
        String accessToken = tokenJson.get("access_token").asText();

        // 2. access_token으로 사용자 정보 요청
        HttpHeaders userInfoHeaders = new HttpHeaders();
        userInfoHeaders.setBearerAuth(accessToken);
        HttpEntity<String> userInfoRequest = new HttpEntity<>(userInfoHeaders);

        ResponseEntity<String> userInfoResponse = restTemplate.exchange(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                HttpMethod.GET,
                userInfoRequest,
                String.class
        );

        JsonNode userInfo = objectMapper.readTree(userInfoResponse.getBody());

        // 3. 필요한 정보 추출
        String email = userInfo.get("email").asText();
        String name = userInfo.get("name").asText();
        String id = userInfo.get("id").asText();

        // TODO: DB에서 확인하고 회원이면 로그인 처리, 아니면 회원가입으로 보내기

        // 4. /auth/social-join 으로 리디렉션
        String redirectUrl = String.format(
            "http://localhost:8888/auth/social-join?provider=GOOGLE&socialId=%s&email=%s&name=%s",
            id, email, name
        );

        return new RedirectView(redirectUrl);
    }
}
