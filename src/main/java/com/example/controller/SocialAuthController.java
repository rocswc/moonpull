package com.example.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
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

    @Value("${app.frontend-base-url:https://34.64.84.23:8888}")
    private String FRONT_BASE;

    @Value("${oauth.naver.client-id}")
    private String naverClientId;

    @Value("${oauth.naver.redirect-uri}")
    private String naverRedirectUri;

    @Value("${oauth.kakao.client-id}")
    private String kakaoClientId;

    @Value("${oauth.kakao.redirect-uri}")
    private String kakaoRedirectUri;

    // ✅ 네이버 로그인 시작
    @GetMapping("/naver/login")
    public void naverLogin(HttpServletResponse response, HttpSession session) throws Exception {
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

    // ✅ 카카오 로그인 시작
    @GetMapping("/kakao/login")
    public void kakaoLogin(HttpServletResponse response) throws Exception {
        String url = "https://kauth.kakao.com/oauth/authorize"
                + "?response_type=code"
                + "&client_id=" + kakaoClientId
                + "&redirect_uri=" + URLEncoder.encode(kakaoRedirectUri, StandardCharsets.UTF_8);
        response.sendRedirect(url);
    }

    // ✅ 콜백 처리 → JS fetch 기반 브릿지 방식
    @GetMapping("/{provider}/callback")
    public ResponseEntity<String> callback(@PathVariable String provider,
                                           @RequestParam String code,
                                           @RequestParam(required = false) String state,
                                           HttpSession session) {
        try {
            final String socialType = provider.toUpperCase();

            if ("NAVER".equals(socialType)) {
                String savedState = (String) session.getAttribute("OAUTH_STATE");
                if (savedState == null || !savedState.equals(state)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("잘못된 state 값");
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

            // ✅ 기존 회원
            if (userService.existsBySocialIdAndType(user.getSocialId(), socialType)) {
                MemberVO m = userService.getBySocialIdAndType(user.getSocialId(), socialType)
                                        .orElseThrow();

                // 브릿지 티켓 발급
                String ticket = jwtUtil.generateBridgeTicket(m);

                // ✅ HTML + JS 반환 → fetch로 브릿지 호출 후 프론트로 이동
                String html = """
                    <!DOCTYPE html>
                    <html lang="ko">
                    <head><meta charset="UTF-8"><title>로그인 처리중...</title></head>
                    <body>
                    <script>
                      (async () => {
                        try {
                          await fetch("https://192.168.56.1:8080/auth/bridge?ticket=%s", {
                            method: "GET",
                            credentials: "include"
                          });
                          window.location = "%s";
                        } catch(e) {
                          console.error("브릿지 호출 실패:", e);
                          alert("로그인 처리 중 오류 발생");
                        }
                      })();
                    </script>
                    </body>
                    </html>
                    """.formatted(
                        URLEncoder.encode(ticket, StandardCharsets.UTF_8),
                        FRONT_BASE + "/"
                    );

                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, "text/html; charset=UTF-8")
                        .body(html);
            }

            // ✅ 신규 회원 → 프론트 회원가입 화면으로
            String joinUrl = FRONT_BASE + "/auth/login"
                    + "?provider=" + enc(socialType)
                    + "&socialId=" + enc(user.getSocialId())
                    + "&email="    + enc(user.getEmail())
                    + "&name="     + enc(user.getName());

            String html = """
                <!DOCTYPE html>
                <html lang="ko">
                <head><meta charset="UTF-8"><title>회원가입 이동중...</title></head>
                <body>
                <script>
                  window.location = "%s";
                </script>
                </body>
                </html>
                """.formatted(joinUrl);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "text/html; charset=UTF-8")
                    .body(html);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("서버 오류 발생");
        }
    }

    private static String enc(String v) {
        return URLEncoder.encode(v == null ? "" : v, StandardCharsets.UTF_8);
    }
}
