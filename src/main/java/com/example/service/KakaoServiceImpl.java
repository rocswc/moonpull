package com.example.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.dto.SocialUserDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class KakaoServiceImpl implements KakaoService {

    @Value("${oauth.kakao.client-id}")
    private String clientId;

    @Value("${oauth.kakao.client-secret}")
    private String clientSecret;

    @Value("${oauth.kakao.redirect-uri}")
    private String redirectUri;

    @Override
    public String getAccessToken(String code) throws Exception {
        RestTemplate restTemplate = new RestTemplate();

        String tokenUrl = "https://kauth.kakao.com/oauth/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String body = "grant_type=authorization_code" +
                      "&client_id=" + clientId +
                      "&redirect_uri=" + redirectUri +
                      "&code=" + code +
                      "&client_secret=" + clientSecret;

        HttpEntity<String> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(response.getBody());
        return rootNode.path("access_token").asText();
    }

    @Override
    public SocialUserDTO getUser(String accessToken) throws Exception {
        RestTemplate restTemplate = new RestTemplate();

        String meUrl = "https://kapi.kakao.com/v2/user/me";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> request = new HttpEntity<>(headers);

        ResponseEntity<String> res = restTemplate.exchange(meUrl, HttpMethod.GET, request, String.class);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(res.getBody());

        String socialId = root.path("id").asText();
        JsonNode acc  = root.path("kakao_account");
        JsonNode prof = acc.path("profile");

        String email   = acc.path("email").asText(null);
        String name    = prof.path("nickname").asText(null);
        String img     = prof.path("profile_image_url").asText(null);

        // ✅ 5개 인자 모두 전달
        return new SocialUserDTO(socialId, "KAKAO", email, name, img);
    }
}
