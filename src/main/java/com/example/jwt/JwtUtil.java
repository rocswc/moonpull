package com.example.jwt;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Set;
import java.util.UUID;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

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
}
