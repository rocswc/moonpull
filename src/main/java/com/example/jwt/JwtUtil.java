package com.example.jwt;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;
import java.util.Set;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.example.VO.MemberVO;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;

@Component
public class JwtUtil {

    private final SecretKey secretKey;

    public JwtUtil(@Value("${spring.jwt.secret}") String secret) {
        this.secretKey = new SecretKeySpec(
            secret.getBytes(StandardCharsets.UTF_8),
            Jwts.SIG.HS256.key().build().getAlgorithm()
        );
    }

    // ★ Access 토큰 생성 (sessionVersion은 long으로 넣되, int여도 Number로 받아 해결 가능)
    public String createAccess(Integer userId, Set<String> roles, int sessionVersion, Duration ttl) {
        var now = java.time.Instant.now();
        return io.jsonwebtoken.Jwts.builder()
            .subject(String.valueOf(userId))
            .claim("roles", String.join(",", roles))
            .claim("ver", sessionVersion)         // int로 저장
            .issuedAt(java.util.Date.from(now))
            .expiration(java.util.Date.from(now.plus(ttl)))
            .signWith(secretKey)                  // 네가 쓰던 방식 유지
            .compact();
    }

    /* -------------- 파싱 -------------- */

    public Jws<Claims> parse(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
    }

    // 만료여도 클레임 열어보기
    public Claims getClaimsAllowExpired(String token) {
        try { return parse(token).getPayload(); }
        catch (ExpiredJwtException ex) { return ex.getClaims(); }
    }

    public String getSubject(String token) {
        try { return parse(token).getPayload().getSubject(); }
        catch (JwtException | IllegalArgumentException e) { return null; }
    }

    public String getRoles(String token) {
        try { return parse(token).getPayload().get("roles", String.class); }
        catch (JwtException | IllegalArgumentException e) { return null; }
    }

    // ★ Number로 받아 long으로 변환 (Integer/Long 모두 OK)
    public Long getVersion(String token) {
        try {
            Object v = parse(token).getPayload().get("ver");
            return (v instanceof Number n) ? n.longValue() : null;
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }

    public boolean isExpired(String token) {
        try {
            Date exp = parse(token).getPayload().getExpiration();
            return exp.before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return true;
        }
    }

    /* ---- 레거시 호환(필요 시 유지) ---- */

    public String getUsername(String token) {
        try { return parse(token).getPayload().get("username", String.class); }
        catch (JwtException | IllegalArgumentException e) { return null; }
    }

    public String getRole(String token) {
        try { return parse(token).getPayload().get("roles", String.class); }
        catch (JwtException | IllegalArgumentException e) { return null; }
    }

    public String createJwt(String username, String nickname, String role, Long expiredMs) {
        return Jwts.builder()
            .claim("username", username)
            .claim("nickname", nickname)
            .claim("roles", role.replace("ROLE_", ""))
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + expiredMs))
            .signWith(secretKey)
            .compact();
    }
 // ✅ 여기 아래에 추가!
    public String generateToken(com.example.VO.MemberVO member) {
        Integer userId = member.getUserId();
        Set<String> roles = Set.of(member.getRoles()); // "MENTOR", "ADMIN" 등
        int sessionVersion = member.getSessionVersion();
        Duration ttl = Duration.ofHours(1); // 1시간 유효
        return createAccess(userId, roles, sessionVersion, ttl);
    }
    // 콜백 → IP 서버로 전달할 "아주 짧은 TTL의 일회성 토큰" TTL(초)
    @Value("${app.one-time-exchange-ttl-seconds:60}")
    private int oneTimeExchangeTtlSeconds;

    /** 콜백(https://localhost:8080)에서 만들어서 JS로 IP 서버에 전달할 "일회성 교환 토큰" */
    public String createOneTimeExchangeToken(Integer userId, String rolesCsv, int sessionVersion) {
        // rolesCsv: "MENTEE" 또는 "MENTEE,ADMIN" 같은 문자열(비어있으면 USER로 대체)
        java.util.Set<String> roles =
            java.util.Arrays.stream( (rolesCsv == null ? "" : rolesCsv).split(",") )
                .map(String::trim).filter(s -> !s.isEmpty())
                .collect(java.util.stream.Collectors.toSet());
        if (roles.isEmpty()) roles = java.util.Set.of("USER");

        return createAccess(
            userId,
            roles,
            sessionVersion,
            java.time.Duration.ofSeconds(oneTimeExchangeTtlSeconds) // 매우 짧게
        );
    }

    // IP 서버에서 일회성 토큰 검증 → MemberVO로 복구 (쿠키 심기 직전 사용) 
    public MemberVO verifyOneTimeExchangeToken(String token) {
        io.jsonwebtoken.Claims claims;
        try {
            claims = parse(token).getPayload(); // 서명/만료 검증
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            throw new RuntimeException("One-time exchange token expired", e);
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
            throw new RuntimeException("Invalid one-time exchange token", e);
        }

        Integer userId = Integer.valueOf(claims.getSubject());
        String rolesStr = claims.get("roles", String.class);
        Object verObj = claims.get("ver");
        int sessionVersion = (verObj instanceof Number n) ? n.intValue() : 0;

        MemberVO m = new MemberVO();
        m.setUserId(userId);
        try { m.setRoles(rolesStr); } catch (Throwable ignore) {}
        try { m.setSessionVersion(sessionVersion); } catch (Throwable ignore) {}
        return m;
    }
 // 콜백 서버에서 IP서버로 넘길 "브릿지 티켓" 생성 (멤버 객체 편의 래퍼)
    public String generateBridgeTicket(MemberVO m) {
        Integer userId = m.getUserId();
        // m.getRoles()가 "MENTEE,ADMIN" 같은 CSV 문자열이라고 가정, null 안전 처리
        String rolesCsv = (m.getRoles() == null || m.getRoles().isBlank()) ? "USER" : m.getRoles();
        int sessionVersion = m.getSessionVersion();
        return createOneTimeExchangeToken(userId, rolesCsv, sessionVersion);
    }

    // IP 서버에서 브릿지 티켓 검증 (기존 verifyOneTimeExchangeToken 래핑)
    public MemberVO verifyBridgeTicket(String ticket) {
        return verifyOneTimeExchangeToken(ticket);
    }
    
    
}
