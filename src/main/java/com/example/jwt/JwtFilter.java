package com.example.jwt;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import com.example.security.CustomUserDetails;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("요청 쿠키: " + Arrays.toString(request.getCookies()));
        System.out.println("[JwtFilter] 요청 URI: " + request.getRequestURI());
        System.out.println("[JwtFilter] 요청 Method: " + request.getMethod());

        // 0. OPTIONS 요청은 인증없이 허용
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // 1. 인증 예외 경로
        String path = request.getRequestURI();
        if (
            path.equals("/api/login") ||
            path.equals("/api/join") ||
            path.equals("/api/check-duplicate") ||
            path.equals("/api/keywords/trending") ||
            path.equals("/api/keywords/autocomplete") ||
            path.equals("/api/profile/check-email") ||
            path.equals("/api/profile/check-phone") ||
            path.equals("/api/chat/log") ||
            path.startsWith("/api/admin/report") ||
            path.startsWith("/api/admin/reports") ||

            path.startsWith("/api/chat/") ||
            path.startsWith("/api/teacher/") ||

            path.startsWith("/api/mentor-id") ||
            path.startsWith("/api/chat/messages") ||

            path.startsWith("/api/mentor/") ||
            path.startsWith("/api/mentors/") ||

            path.startsWith("/api/mentoring/chatId") ||
            path.startsWith("/api/mentoring/accept") ||

            path.startsWith("/admin/") ||
            path.equals("/apply/mentor") ||
            path.startsWith("/mentee/") ||
            path.startsWith("/payments/") ||

            path.startsWith("/api/mentor-review/") ||
            path.equals("/mentorReview/insert") ||
            path.startsWith("/mentorReview/")
        ) {
            System.out.println("✅ [JwtFilter] 인증 예외 경로 - 필터 통과: " + path);
            filterChain.doFilter(request, response);
            return;
        }

        // 2. 쿠키에서 JWT 추출
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
            System.out.println("❌ JWT 쿠키가 없음");
            filterChain.doFilter(request, response);
            return;
        }

        // 3. 토큰 만료 확인
        if (jwtUtil.isExpired(token)) {
            System.out.println("❌ JWT 토큰 만료됨");
            filterChain.doFilter(request, response);
            return;
        }

        // 4. 사용자 정보 추출
        String username = jwtUtil.getUsername(token);
        String rolesString = jwtUtil.getRole(token);

        System.out.println("[JwtFilter] ✅ username: " + username);
        System.out.println("[JwtFilter] ✅ roles: " + rolesString);

        if (rolesString == null || rolesString.trim().isEmpty()) {
            System.out.println("❌ JWT 토큰에 roles 정보 없음");
            filterChain.doFilter(request, response);
            return;
        }

        // 5. 권한 설정
        List<SimpleGrantedAuthority> authorities = Arrays.stream(rolesString.split(","))
            .map(String::trim)
            .filter(role -> !role.isEmpty())
            .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
            .map(SimpleGrantedAuthority::new)
            .toList();

        // 6. DB에서 사용자 정보 조회
        Optional<MemberVO> optionalUser = userRepository.findByLoginid(username);

        if (optionalUser.isEmpty()) {
            System.out.println("❌ DB에 해당 loginid 사용자 없음: " + username);
            filterChain.doFilter(request, response);
            return;
        }

        MemberVO userEntity = optionalUser.get();

        // 7. CustomUserDetails 생성 및 인증 설정
        CustomUserDetails customUserDetails = new CustomUserDetails(userEntity, authorities);

        Authentication authToken = new UsernamePasswordAuthenticationToken(
            customUserDetails, null, authorities);

        SecurityContextHolder.getContext().setAuthentication(authToken);

        System.out.println("✅ SecurityContext 인증 완료: " + authToken);
        System.out.println("✅ 권한 목록: " + authToken.getAuthorities());

        // 8. 다음 필터 체인 진행
        filterChain.doFilter(request, response);
    }
}
