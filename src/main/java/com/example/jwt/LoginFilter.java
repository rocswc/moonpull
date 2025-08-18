package com.example.jwt;

import java.io.IOException;
import java.time.Duration;
import java.util.Date;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import com.example.dto.LoginDTO;
import com.example.security.CustomUserDetails;
import com.example.service.SessionService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

public class LoginFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final SessionService sessionService; // ★ 추가

    // 프론트엔드에서 /api/login으로 로그인 요청
    public LoginFilter(AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil,
                       UserRepository userRepository,
                       SessionService sessionService) {        // ★ 추가
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.sessionService = sessionService;                  // ★ 저장
        setFilterProcessesUrl("/api/login");
        
        // ★★★ 중요: 부모 필터에 AuthenticationManager 등록 ★★★
        setAuthenticationManager(authenticationManager);
    }

    // 로그인 필터 실행
    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {
        try {
            var objectMapper = new ObjectMapper();
            LoginDTO loginRequest = objectMapper.readValue(request.getInputStream(), LoginDTO.class);

            String loginid = loginRequest.getLoginId();
            String password = loginRequest.getPassword();

            // DB 사용자 확인 + 정지 체크
            MemberVO member = userRepository.findByLoginid(loginid)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            if (Boolean.TRUE.equals(member.getIsBanned())) {
                Date now = new Date();
                Date expire = member.getBanExpireDate();
                if (expire == null || now.before(expire)) {
                    String reason = member.getBanReason() != null ? member.getBanReason() : "관리자에 의해 정지되었습니다.";
                    String when   = expire != null ? " (해제일: " + expire + ")" : "";
                    sendBanResponse(response, "정지된 계정입니다. 사유: " + reason + when);
                    return null;
                }
            }

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(loginid, password);

            return authenticationManager.authenticate(authToken);

        } catch (IOException e) {
            throw new RuntimeException("로그인 요청 JSON 파싱 실패", e);
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response,
                                            FilterChain chain, Authentication authentication)
            throws IOException, ServletException {

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        String loginId = principal.getUsername();
        String nickname = principal.getNickname();

        // 마지막 로그인 시간 업데이트
        userRepository.updateLastLogin(loginId);

        // 권한 추출 → Set<String> (ROLE_ 접두사는 세션/토큰 저장 시 제거해도 무방)
        Set<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.startsWith("ROLE_") ? r.substring(5) : r) // USER,ADMIN 형태
                .collect(Collectors.toSet());

        // PK/버전 로딩
        MemberVO member = userRepository.findByLoginid(loginId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        Integer userId = member.getUserId();              // PK
        int sessionVersion = (member.getSessionVersion() == null) ? 0 : member.getSessionVersion(); // 컬럼명 맞춰 쓰기

        // ★ 서버 세션 생성(+ refresh 정보 저장)
        HttpSession httpSession = request.getSession(true);
        sessionService.create(
                httpSession,
                userId,
                roles,
                sessionVersion,
                Duration.ofDays(14),   // Refresh TTL (서버측만)
                30 * 60                // 세션 유휴 만료(30분) — 필요 시 properties로 이동 가능
        );

        // ★ 짧은 Access 토큰 발급(예: 10분) — JwtUtil에 createAccess 있어야 함
        String access = jwtUtil.createAccess(userId, roles, sessionVersion, Duration.ofMinutes(10));

     // ★ Access를 HttpOnly 쿠키로 내려줌
        ResponseCookie accessCookie = ResponseCookie.from("jwt", access)   // ← ACCESS → jwt
                .httpOnly(true)
                .secure(true)            // HTTPS 필수
                .sameSite("None")        // ← 교차 사이트 XHR이면 반드시 None
                .path("/")
                .maxAge(10 * 60)         // 10분
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());

        // 응답 JSON (토큰 안 내보내도 되지만, 기존 프론트 의존성 있으면 유지)
        response.setContentType("application/json; charset=UTF-8");
        response.getWriter().write(
                new ObjectMapper().writeValueAsString(
                        Map.of(
                                "ok", true,
                                "loginId", loginId,
                                "nickname", nickname,
                                "roles", roles
                        )
                )
        );
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
                                              AuthenticationException failed)
            throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json; charset=UTF-8");
        response.getWriter().write("{\"error\": \"인증 실패\"}");
    }

    // 정지 응답
    private void sendBanResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\": \"" + message + "\"}");
    }
}
