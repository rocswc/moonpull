package com.example.jwt;

import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import com.example.security.CustomUserDetails;
import com.example.service.SessionService;
import com.example.session.ServerSession;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

//... import 동일

public class JwtFilter extends OncePerRequestFilter {

 private final JwtUtil jwtUtil;
 private final UserRepository userRepository;
 private final SessionService sessionService;

 public JwtFilter(JwtUtil jwtUtil, UserRepository userRepository, SessionService sessionService) {
     this.jwtUtil = jwtUtil;
     this.userRepository = userRepository;
     this.sessionService = sessionService;
 }

 @Override
 protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
         throws ServletException, IOException {

     // 1) OPTIONS 패스
     if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
         filterChain.doFilter(request, response);
         return;
     }

     // 2) 인증 예외 경로
     String path = request.getRequestURI();
     if (
         path.equals("/api/login") ||
         path.equals("/api/join") ||
         path.equals("/api/logout") ||   
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
         path.startsWith("/api/mentoring/mentorByChatId") ||
         path.startsWith("/api/mentoring/menteeByChatId") ||
         path.startsWith("/api/chat/messages") ||
         path.startsWith("/api/mentor/") ||
         path.startsWith("/api/mentors/") ||
         path.startsWith("/api/mentoring/chatId") ||
         path.startsWith("/admin/") ||
         path.equals("/apply/mentor") ||
         path.startsWith("/mentee/") ||
         path.startsWith("/payments/") ||
         path.startsWith("/api/mentor-review/") ||
         path.equals("/mentorReview/insert") ||
         path.startsWith("/mentorReview/") ||

         // 소셜 로그인 콜백/브릿지
         path.startsWith("/auth/kakao/") ||
         path.startsWith("/auth/google/") ||
         path.startsWith("/auth/naver/") ||
         path.startsWith("/auth/bridge")
     ) {
         filterChain.doFilter(request, response);
         return;
     }

     // 3) 쿠키에서 jwt 읽기
     String token = readCookie(request, "jwt");
     if (token == null) token = readCookie(request, "ACCESS");

     HttpSession httpSession = request.getSession(false);
     Optional<ServerSession> sessOpt = sessionService.get(httpSession);

     // 4) 토큰 유효 → 세션 있으면 버전 검사, 없으면 패스
     if (token != null) {
         try {
             Claims claims = jwtUtil.parse(token).getPayload();

             if (sessOpt.isPresent() && !versionMatches(claims, sessOpt)) {
                 unauthorized(response); // 버전 불일치만 차단
                 return;
             }

             // 세션 없어도 JWT만으로 인증 허용
             authenticateWithClaims(claims, sessOpt);
             filterChain.doFilter(request, response);
             return;

         } catch (ExpiredJwtException ex) {
             // 만료 → 아래 refresh 로직
         } catch (Exception e) {
             filterChain.doFilter(request, response); // 토큰 손상 등 → 익명
             return;
         }
     }

     // 5) 토큰 없음/만료 → 세션(refresh)로 재발급
     if (sessOpt.isPresent()) {
         ServerSession s = sessOpt.get();
         if (s.refreshExpiry().isAfter(java.time.Instant.now())) {
             sessionService.rotateRefresh(httpSession, Duration.ofDays(14));
             String newJwt = jwtUtil.createAccess(
                     s.userId(), s.roles(), s.sessionVersion(), Duration.ofMinutes(10));
             setAccessCookie(response, newJwt);
             setAuthentication(s.userId(), s.roles());
             filterChain.doFilter(request, response);
             return;
         }
     }

     // 6) 익명 진행
     filterChain.doFilter(request, response);
 }

 /* ------------ helpers ------------ */

 private String readCookie(HttpServletRequest req, String name) {
     if (req.getCookies() == null) return null;
     for (Cookie c : req.getCookies()) if (name.equals(c.getName())) return c.getValue();
     return null;
 }

 private boolean versionMatches(Claims claims, Optional<ServerSession> sessOpt) {
     if (sessOpt.isEmpty()) return true; // 세션 없으면 무조건 OK
     ServerSession s = sessOpt.get();
     Object v = claims.get("ver");
     long tokenVer = (v instanceof Number n) ? n.longValue() : Long.MIN_VALUE;
     return (v == null) || (tokenVer == s.sessionVersion());
 }

    private void authenticateWithClaims(Claims claims, Optional<ServerSession> sessOpt) {
        Integer userId = Integer.valueOf(claims.getSubject());
        String rolesCsv = claims.get("roles", String.class);
        Set<String> roles = (rolesCsv == null || rolesCsv.isBlank())
                ? sessOpt.map(ServerSession::roles).orElseGet(java.util.Set::of)
                : Arrays.stream(rolesCsv.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toSet());
        setAuthentication(userId, roles);
    }

    private void setAuthentication(Integer userId, Set<String> roles) {
        MemberVO user = userRepository.findById(userId).orElseGet(() -> {
            MemberVO m = new MemberVO();
            m.setUserId(userId);
            m.setRoles(String.join(",", roles));
            return m;
        });

        List<SimpleGrantedAuthority> authorities = roles.stream()
                .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                .map(SimpleGrantedAuthority::new)
                .toList();

        CustomUserDetails cud = new CustomUserDetails(user, authorities);
        Authentication authToken =
            new UsernamePasswordAuthenticationToken(cud, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    // ★ 백엔드-프론트 도메인이 다르면 None, 같으면 Lax 사용
    private void setAccessCookie(HttpServletResponse res, String token) {
        ResponseCookie c = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")   // 프론트 : https://localhost:8888, 백 : https://localhost:8080 → 교차 사이트면 None
                .path("/")
                .maxAge(10 * 60)
                .build();
        res.addHeader(HttpHeaders.SET_COOKIE, c.toString());
    }

    // ★ 로그아웃 시 쿠키 즉시 삭제할 때 사용 (프론트/백 동일 속성으로)
    public static void addDeleteCookie(HttpServletResponse res) {
        ResponseCookie del = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(0)
                .build();
        res.addHeader(HttpHeaders.SET_COOKIE, del.toString());
    }

    private void unauthorized(HttpServletResponse res) throws IOException {
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"error\":\"unauthorized\"}");
    }
}
