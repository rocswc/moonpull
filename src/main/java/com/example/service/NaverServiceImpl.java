package com.example.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.dto.SocialUserDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class NaverServiceImpl implements NaverService {

    @Value("${oauth.naver.client-id}")
    private String clientId;

    @Value("${oauth.naver.client-secret}")
    private String clientSecret;

    @Value("${oauth.naver.redirect-uri}")
    private String redirectUri;

    @Override
    public String getAccessToken(String code, String state) throws Exception {
        RestTemplate rest = new RestTemplate();

        String tokenUrl = "https://nid.naver.com/oauth2.0/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // grant_type, client_id, client_secret, code, state, redirect_uri
        String body =
            "grant_type=authorization_code" +
            "&client_id=" + enc(clientId) +
            "&client_secret=" + enc(clientSecret) +
            "&code=" + enc(code) +
            (state != null ? "&state=" + enc(state) : "") +
            "&redirect_uri=" + enc(redirectUri);

        HttpEntity<String> req = new HttpEntity<>(body, headers);
        ResponseEntity<String> res = rest.postForEntity(tokenUrl, req, String.class);

        ObjectMapper om = new ObjectMapper();
        JsonNode root = om.readTree(res.getBody());
        return root.path("access_token").asText();
    }

    @Override
    public SocialUserDTO getUser(String accessToken) throws Exception {
        RestTemplate rest = new RestTemplate();

        String meUrl = "https://openapi.naver.com/v1/nid/me";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Void> req = new HttpEntity<>(headers);

        ResponseEntity<String> res = rest.exchange(meUrl, HttpMethod.GET, req, String.class);

        ObjectMapper om = new ObjectMapper();
        JsonNode root = om.readTree(res.getBody());
        JsonNode r = root.path("response");

        String socialId = r.path("id").asText(null);
        String email    = r.path("email").asText(null);
        String name     = r.path("name").asText(null);
        String img      = r.path("profile_image").asText(null);

        // ✅ 5개 인자 모두 전달 (두 번째 인자: socialType)
        return new SocialUserDTO(socialId, "NAVER", email, name, img);
    }

    private static String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
