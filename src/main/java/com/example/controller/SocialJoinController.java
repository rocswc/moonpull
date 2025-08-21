package com.example.controller;

import java.net.URI;
import java.util.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import com.example.jwt.JwtUtil;

@RestController
public class SocialJoinController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${app.frontend-base-url:https://localhost:8888}")
    private String FRONT_BASE;

    public SocialJoinController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // ✅ 리다이렉트 전용 (소셜 콜백 이후 SPA 페이지로 보내기)
    @GetMapping("/auth/social-join/redirect")
    public ResponseEntity<Void> redirectToFrontend(
            @RequestParam String provider,
            @RequestParam String socialId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String mode
    ) {
        String url = UriComponentsBuilder.fromHttpUrl(FRONT_BASE)
                .path("/auth/social-join")
                .queryParam("provider", provider)
                .queryParam("socialId", socialId)
                .queryParam("email", Optional.ofNullable(email).orElse(""))
                .queryParam("name", Optional.ofNullable(name).orElse(""))
                .queryParam("phone", Optional.ofNullable(phone).orElse(""))
                .queryParamIfPresent("mode", Optional.ofNullable(mode))
                .build()
                .toUriString();

        return ResponseEntity.status(HttpStatus.SEE_OTHER) // 303
                .location(URI.create(url))
                .build();
    }

    // ✅ 백엔드 처리 API (가입 여부 확인 및 로그인 쿠키 발급)
    @PostMapping("/api/auth/social-join")
    public ResponseEntity<?> decideOrLogin(@RequestBody SocialJoinRequest req) {
        if (req.getProvider() == null || req.getSocialId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "provider/socialId 필수"));
        }

        String provider = req.getProvider().toUpperCase();
        Optional<MemberVO> linkOpt = userRepository.findBySocialTypeAndSocialId(provider, req.getSocialId());

        if (linkOpt.isPresent()) {
            MemberVO user = linkOpt.get();

            String token = jwtUtil.createJwt(
                user.getUserId().toString(),
                user.getNickname(),
                user.getRoles(),
                1000L * 60 * 60 * 24 // 24시간
            );

            ResponseCookie cookie = ResponseCookie.from("jwt", token)
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("None")
                    .path("/")
                    .maxAge(60L * 60 * 24)
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(Map.of("loggedIn", true, "userId", user.getUserId()));
        }

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                "loggedIn", false,
                "needSignup", true
        ));
    }

    // ✅ DTO
    public static class SocialJoinRequest {
        private String provider;
        private String socialId;
        private String email;
        private String name;
        private String phone;
        // getter/setter ...
        public String getProvider() { return provider; }
        public void setProvider(String provider) { this.provider = provider; }
        public String getSocialId() { return socialId; }
        public void setSocialId(String socialId) { this.socialId = socialId; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }
}
