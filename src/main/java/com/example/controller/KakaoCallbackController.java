package com.example.controller;

import java.net.URI;
import java.net.URLEncoder;                 // ★ 추가
import java.nio.charset.StandardCharsets;  // ★ 추가

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

            String socialType = "KAKAO";
            String socialId   = String.valueOf(userInfo.getId());
            String email      = (userInfo.getKakaoAccount()!=null) ? userInfo.getKakaoAccount().getEmail() : null;
            String name       = (userInfo.getKakaoAccount()!=null && userInfo.getKakaoAccount().getProfile()!=null)
                    ? userInfo.getKakaoAccount().getProfile().getNickname()
                    : null;

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

            String joinUrl = "http://localhost:8888/auth/social-join"
                    + "?provider=" + enc(socialType)
                    + "&socialId=" + enc(socialId)
                    + "&email="    + enc(email)
                    + "&name="     + enc(name);

            return ResponseEntity.status(HttpStatus.FOUND)
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
