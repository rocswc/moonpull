package com.example.controller;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import com.example.jwt.JwtUtil;

import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/auth/naver")
@RequiredArgsConstructor
public class NaverController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${naver.client.id}")
    private String clientId;

    @Value("${naver.client.secret}")
    private String clientSecret;

    @Value("${naver.redirect.uri}")
    private String redirectUri;

    @GetMapping("/callback")
    public ResponseEntity<?> callback(@RequestParam String code, @RequestParam String state) {
        // 1. access token 요청
        String tokenUrl = "https://nid.naver.com/oauth2.0/token";

        UriComponentsBuilder tokenRequestUri = UriComponentsBuilder.fromHttpUrl(tokenUrl)
            .queryParam("grant_type", "authorization_code")
            .queryParam("client_id", clientId)
            .queryParam("client_secret", clientSecret)
            .queryParam("code", code)
            .queryParam("state", state);

        ResponseEntity<Map> tokenResponse = restTemplate.getForEntity(tokenRequestUri.toUriString(), Map.class);
        String accessToken = (String) tokenResponse.getBody().get("access_token");

        // 2. 사용자 정보 요청
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> profileResponse = restTemplate.exchange(
            "https://openapi.naver.com/v1/nid/me",
            HttpMethod.GET,
            entity,
            Map.class
        );

        Map<String, Object> response = (Map<String, Object>) profileResponse.getBody().get("response");

        // 3. 정보 추출
        String email = (String) response.get("email");
        String name = (String) response.get("name");
        String phone = (String) response.get("mobile");
        String gender = (String) response.get("gender");
        String birthyear = (String) response.get("birthyear");
        String birthday = (String) response.get("birthday");
        String socialId = (String) response.get("id");
        String fullBirthday = birthyear + birthday.replace("-", "");

        // 4. 유저 조회 / 생성
     // 4. 유저 조회 / 생성
        Optional<MemberVO> optionalUser = userRepository.findBySocialIdAndSocialType(socialId, "NAVER");

        MemberVO user;
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
        } else {
            user = MemberVO.builder()
                .socialId(socialId)
                
                .socialType("NAVER")
                .isSocial(true)
                .email(email)
                .name(name)
                .phonenumber(phone.replaceAll("-", ""))
                .birthday(fullBirthday)
                .gender(gender != null && (gender.equals("M") || gender.equals("F")) ? gender : "U")
                .nickname("naver_" + UUID.randomUUID().toString().substring(0, 8))
                .roles("MENTEE")
                .isBanned(false)
                .build();

            userRepository.save(user);
        }

        // ✅ 여기 아래에 추가해!
        String jwt = jwtUtil.createJwt(
            user.getEmail(),               // username 역할 (login_id 대신)
            user.getNickname(),           
            user.getRoles(),              
            24 * 60 * 60 * 1000L          // 24시간 (ms)
        );

        // ✅ 프론트로 토큰과 유저 정보 응답
        return ResponseEntity.ok(Map.of(
            "token", jwt,
            "user", user
        ));
    }
}
