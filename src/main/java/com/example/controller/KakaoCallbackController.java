package com.example.controller;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.VO.MemberVO;
import com.example.dto.KakaoUserDTO;
import com.example.jwt.JwtUtil;
import com.example.service.KakaoService;
import com.example.service.UserService;

@RestController
public class KakaoCallbackController {

    private final KakaoService kakaoService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public KakaoCallbackController(KakaoService kakaoService, UserService userService, JwtUtil jwtUtil) {
        this.kakaoService = kakaoService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/auth/kakao/callback")
    public ResponseEntity<Void> kakaoCallback(@RequestParam String code) {
        try {
            String accessToken = kakaoService.getAccessToken(code);
            KakaoUserDTO userInfo = kakaoService.getUserInfo(accessToken);

            final String socialType = "KAKAO";
            final String socialId   = String.valueOf(userInfo.getId());
            final String email      = (userInfo.getKakaoAccount()!=null) ? userInfo.getKakaoAccount().getEmail() : null;

            // 기존 회원: JWT 쿠키 심고 홈으로 이동
            if (userService.existsBySocialIdAndType(socialId, socialType)) {
                MemberVO m = userService.getBySocialIdAndType(socialId, socialType)
                                        .orElseThrow();

                // ★ sub = 내부 PK(m.getId()) 로 발급되도록 구현되어 있어야 함
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

            // 신규 회원: 소셜 가입 페이지로 이동 (name 제거)
            String joinUrl = "https://localhost:8888/auth/social-join"
                    + "?provider=" + enc(socialType)
                    + "&socialId=" + enc(socialId)
                    + "&email="    + enc(email);

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
