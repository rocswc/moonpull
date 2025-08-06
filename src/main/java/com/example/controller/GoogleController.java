package com.example.controller;

import java.net.URI;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value; // 추가!
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import com.example.jwt.JwtUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class GoogleController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    @GetMapping("/google/callback")
    public ResponseEntity<?> googleCallback(@RequestParam("code") String code) {
        // 1. 구글에 access token 요청
        String tokenUrl = "https://oauth2.googleapis.com/token";

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", "http://localhost:8888/auth/google/callback");
        params.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, request, Map.class);
        String accessToken = (String) tokenResponse.getBody().get("access_token");

        // 2. 사용자 정보 요청
        String userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
        HttpHeaders userInfoHeaders = new HttpHeaders();
        userInfoHeaders.setBearerAuth(accessToken);
        HttpEntity<?> userInfoRequest = new HttpEntity<>(userInfoHeaders);

        ResponseEntity<Map> userInfoResponse = restTemplate.exchange(
                userInfoUrl, HttpMethod.GET, userInfoRequest, Map.class);

        Map<String, Object> userInfo = userInfoResponse.getBody();
        String email = (String) userInfo.get("email");
        String name = (String) userInfo.get("name");

        // 3. DB 저장 또는 조회
        MemberVO member = userRepository.findByEmail(email).orElseGet(() -> {
            MemberVO newMember = new MemberVO();
            newMember.setEmail(email);
            newMember.setName(name);
            newMember.setSocialType("google");
            return userRepository.save(newMember);
        });

        // 4. JWT 생성 (24시간 유효)
        String jwt = jwtUtil.createJwt(
                member.getEmail(),
                member.getName(),
                member.getRoles(),
                1000L * 60 * 60 * 24
        );

        // 5. 프론트 리디렉션
        URI redirect = URI.create("http://localhost:3000/oauth/callback?token=" + jwt);
        return ResponseEntity.status(302).location(redirect).build();
    }
}

