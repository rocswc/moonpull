package com.example.jwt;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.VO.MemberVO;
import com.example.security.CustomUserDetails;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
    	
    	  // 0. OPTIONS 요청은 인증없이 허용
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // 1. 인증 예외 경로
        String path = request.getRequestURI();
        if (path.equals("/") || 
            path.equals("/login") || 
            path.equals("/api/join") || 
            path.startsWith("/api/join")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 1. 쿠키에서 JWT 추출
        String token = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token == null) {
            System.out.println("JWT 쿠키가 없음");
            filterChain.doFilter(request, response);
            return;
        }

        System.out.println("[JwtFilter] JWT Token from Cookie: " + token);

        // 2. 토큰 만료 확인
        if (jwtUtil.isExpired(token)) {
            System.out.println("JWT 토큰 만료됨");
            filterChain.doFilter(request, response);
            return;
        }

        // 3. 사용자 정보 추출
        String username = jwtUtil.getUsername(token);
        String rolesString = jwtUtil.getRole(token);

        System.out.println("[JwtFilter] username: " + username);
        System.out.println("[JwtFilter] roles: " + rolesString);

        if (rolesString == null || rolesString.trim().isEmpty()) {
            System.out.println("JWT 토큰에 roles 정보 없음");
            filterChain.doFilter(request, response);
            return;
        }

        // 4. 권한 설정
        List<SimpleGrantedAuthority> authorities = Arrays.stream(rolesString.split(","))
                .map(String::trim)
                .filter(role -> !role.isEmpty())
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        MemberVO userEntity = new MemberVO();
        userEntity.setLoginid(username);
        userEntity.setPasswordhash("temppassword");
        userEntity.setRoles(rolesString);

        CustomUserDetails customUserDetails = new CustomUserDetails(userEntity, authorities);

        Authentication authToken = new UsernamePasswordAuthenticationToken(
                customUserDetails, null, authorities);

        SecurityContextHolder.getContext().setAuthentication(authToken);

        System.out.println("SecurityContext 인증 완료: " + authToken);
        System.out.println("권한 목록: " + authToken.getAuthorities());

        filterChain.doFilter(request, response);
    }
}
