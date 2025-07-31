package com.example.jwt;

import java.io.IOException;
import java.util.Collection;
import java.util.stream.Collectors;

import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.dto.LoginDTO;
import com.example.security.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// 로그인 요청 처리 필터 (POST /login 요청 시 동작)
public class LoginFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public LoginFilter(AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
    	this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        setFilterProcessesUrl("/api/login"); 
    }

    // 로그인 시도 처리
    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            LoginDTO loginRequest = objectMapper.readValue(request.getInputStream(), LoginDTO.class);

            String loginid = loginRequest.getLoginId();
            String password = loginRequest.getPassword();

            System.out.println("[LoginFilter] 입력 loginId=" + loginid);

            UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(loginid, password);

            return authenticationManager.authenticate(authToken);

        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("로그인 요청 JSON 파싱 실패", e);
        }
    }

    // 로그인 성공 시 처리 (JWT를 HttpOnly 쿠키에 저장)
    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response,
                                            FilterChain chain, Authentication authentication)
            throws IOException, ServletException {

        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
        String username = customUserDetails.getUsername();

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String roles = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        // JWT 생성 (1시간 유효)
        String token = jwtUtil.createJwt(username, roles, 60 * 60 * 1000L);

      
        
     // JWT를 ResponseCookie로 설정 (SameSite 지원)
        ResponseCookie cookie = ResponseCookie.from("jwt", token)
            .httpOnly(true)
            .secure(!request.getServerName().equals("localhost")) // 로컬은 false
            .sameSite("Lax") // 또는 "None" (크로스사이트 대응 필요 시)
            .path("/")
            .maxAge(60 * 60) // 1시간
            .build();

        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        System.out.println("[LoginFilter] 로그인 성공: 아이디 = " + username + ", 권한 = " + roles);
        System.out.println("[LoginFilter] JWT 쿠키 발급 완료");

        // 응답 바디 (토큰 포함 X)
        response.setContentType("application/json; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"message\": \"로그인 성공\"}");
    }

    // 로그인 실패 시 처리
    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
                                              AuthenticationException failed)
            throws IOException, ServletException {

        System.out.println("로그인 실패: " + failed.getMessage());

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json; charset=UTF-8");
        response.getWriter().write("{\"error\": \"인증 실패\"}");
    }
}
