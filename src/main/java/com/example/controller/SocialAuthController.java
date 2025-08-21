// src/main/java/com/example/controller/SocialAuthController.java
package com.example.controller;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.VO.MemberVO;
import com.example.dto.SocialUserDTO;
import com.example.jwt.JwtUtil;
import com.example.service.KakaoService;
import com.example.service.NaverService;
import com.example.service.UserService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

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

    @Value("${oauth.naver.client-id}")
    private String naverClientId;

    @Value("${oauth.naver.redirect-uri}")
    private String naverRedirectUri;

    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    @Value("${app.cookie.samesite:NONE}")
    private String cookieSameSite;

    // ✅ 네이버 로그인 시작 URL
    @GetMapping("/naver/login")
    public void naverLogin(HttpServletResponse response, HttpSession session) throws IOException {
        // state 값 생성 후 세션/Redis 등에 저장
        String state = UUID.randomUUID().toString();
        session.setAttribute("OAUTH_STATE", state);

        String redirectUriEnc = URLEncoder.encode(naverRedirectUri, StandardCharsets.UTF_8);

        String naverAuthUrl = "https://nid.naver.com/oauth2.0/authorize"
                + "?response_type=code"
                + "&client_id=" + naverClientId
                + "&redirect_uri=" + redirectUriEnc
                + "&state=" + state;

        response.sendRedirect(naverAuthUrl);
    }  
    
    // ✅ 카카오 프로퍼티 주입
    @Value("${oauth.kakao.client-id}")
    private String kakaoClientId;

    @Value("${oauth.kakao.redirect-uri}")
    private String kakaoRedirectUri;

    // ✅ 카카오 로그인 시작
    @GetMapping("/kakao/login")
    public void kakaoLogin(HttpServletResponse response) throws IOException {
        String url = "https://kauth.kakao.com/oauth/authorize"
                + "?response_type=code"
                + "&client_id=" + kakaoClientId
                + "&redirect_uri=" + URLEncoder.encode(kakaoRedirectUri, StandardCharsets.UTF_8);
        response.sendRedirect(url);
    }

    // ✅ 콜백 처리
    @GetMapping("/{provider}/callback")
    public ResponseEntity<Void> callback(@PathVariable String provider,
                                         @RequestParam String code,
                                         @RequestParam(required = false) String state,
                                         HttpSession session) {
        try {
            final String socialType = provider.toUpperCase();

            // state 검증
            if ("NAVER".equals(socialType)) {
                String savedState = (String) session.getAttribute("OAUTH_STATE");
                if (savedState == null || !savedState.equals(state)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
                }
            }

            SocialUserDTO user = switch (socialType) {
                case "KAKAO" -> {
                    String token = kakaoService.getAccessToken(code);
                    yield kakaoService.getUser(token);
                }
                case "NAVER" -> {
                    String token = naverService.getAccessToken(code, state);
                    yield naverService.getUser(token);
                }
                default -> throw new IllegalArgumentException("지원하지 않는 provider: " + provider);
            };

            // 기존 회원 → JWT 쿠키 세팅 후 홈으로
            if (userService.existsBySocialIdAndType(user.getSocialId(), socialType)) {
                MemberVO m = userService.getBySocialIdAndType(user.getSocialId(), socialType)
                                        .orElseThrow();

                String jwt = jwtUtil.generateToken(m);

                ResponseCookie cookie = ResponseCookie.from("jwt", jwt)
                        .httpOnly(true)
                        .secure(cookieSecure)
                        .sameSite(cookieSameSite)
                        .path("/")
                        .maxAge(60L * 60 * 24 * 7)
                        .build();

                return ResponseEntity.status(HttpStatus.SEE_OTHER)
                        .header(HttpHeaders.SET_COOKIE, cookie.toString())
                        .location(URI.create(FRONT_BASE + "/"))
                        .build();
            }

         // 신규 회원 → 로그인 페이지로 보낸 뒤 모달 띄움
            String joinUrl = FRONT_BASE + "/auth/login"
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