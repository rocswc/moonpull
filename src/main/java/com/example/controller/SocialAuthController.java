// src/main/java/com/example/controller/SocialAuthController.java
package com.example.controller;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import com.example.VO.MemberVO;
import com.example.dto.SocialUserDTO;
import com.example.jwt.JwtUtil;
import com.example.service.KakaoService;
import com.example.service.NaverService;
import com.example.service.UserService;

@RestController
@RequestMapping("/auth")
public class SocialAuthController {

    private final KakaoService kakaoService;
    private final NaverService naverService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public SocialAuthController(KakaoService kakaoService,
                                NaverService naverService,
                                UserService userService,
                                JwtUtil jwtUtil) {
        this.kakaoService = kakaoService;
        this.naverService = naverService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @Value("${app.frontend-base-url:https://localhost:8888}")
    private String FRONT_BASE;

    @Value("${app.cookie.secure:true}")   // dev(http)면 false
    private boolean cookieSecure;

    @Value("${app.cookie.samesite:NONE}") // dev(http)면 LAX
    private String cookieSameSite;

    @GetMapping("/{provider}/callback")
    public ResponseEntity<Void> callback(@PathVariable String provider,
                                         @RequestParam String code,
                                         @RequestParam(required = false) String state) {
        try {
            final String socialType = provider.toUpperCase();

            // provider별 사용자 정보 공통 DTO로 획득
            SocialUserDTO user = switch (socialType) {
                case "KAKAO" -> {
                    String token = kakaoService.getAccessToken(code);
                    yield kakaoService.getUser(token);
                }
                case "NAVER" -> {
                    // TODO: state 검증(로그인 시작 시 저장한 state와 동일한지)
                    String token = naverService.getAccessToken(code, state);
                    yield naverService.getUser(token);
                }
                default -> throw new IllegalArgumentException("지원하지 않는 provider: " + provider);
            };

            // 기존 소셜 회원이면 JWT 쿠키 심고 홈으로
            if (userService.existsBySocialIdAndType(user.getSocialId(), socialType)) {
                MemberVO m = userService.getBySocialIdAndType(user.getSocialId(), socialType)
                                        .orElseThrow();

                String jwt = jwtUtil.generateToken(m); // sub=내부 PK 기준

                ResponseCookie cookie = ResponseCookie.from("jwt", jwt)
                        .httpOnly(true)
                        .secure(cookieSecure)
                        .sameSite(cookieSameSite) // "NONE" or "LAX"
                        .path("/")
                        .maxAge(60L * 60 * 24 * 7)
                        .build();

                return ResponseEntity.status(HttpStatus.SEE_OTHER)
                        .header(HttpHeaders.SET_COOKIE, cookie.toString())
                        .location(URI.create(FRONT_BASE + "/"))
                        .build();
            }

            // 신규 소셜 회원 → 소셜가입 페이지로 리다이렉트
            String joinUrl = FRONT_BASE + "/auth/social-join"
                    + "?provider=" + enc(socialType)
                    + "&socialId=" + enc(user.getSocialId())
                    + "&email="    + enc(user.getEmail())
                    + "&name="     + enc(user.getName());

            return ResponseEntity.status(HttpStatus.SEE_OTHER)
                    .location(URI.create(joinUrl))
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private static String enc(String v) {
        return URLEncoder.encode(v == null ? "" : v, StandardCharsets.UTF_8);
    }
}
