package com.example.jwt;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.example.VO.MemberVO;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;

@Component // Spring에서 Bean으로 등록되어 DI 대상이 됨
public class JwtUtil {

    private final SecretKey secretKey;

    // 생성자에서 application.properties의 시크릿 값을 읽어 HS256 키로 변환
    public JwtUtil(@Value("${spring.jwt.secret}") String secret) {
        this.secretKey = new SecretKeySpec(
            secret.getBytes(StandardCharsets.UTF_8), // UTF-8로 인코딩
            Jwts.SIG.HS256.key().build().getAlgorithm() // HS256 알고리즘 키 설정
        );
    }

    // ✅ subject(PK) 추출
    public String getSubject(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("getSubject 토큰 파싱 오류: " + e.getMessage());
            return null;
        }
    }

    // JWT에서 "username" 클레임 추출
    public String getUsername(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("username", String.class);
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("getUsername 토큰 파싱 오류: " + e.getMessage());
            return null;
        }
    }

    // JWT에서 "roles" 클레임 추출 (예: ROLE_USER,ROLE_ADMIN 또는 USER,ADMIN)
    public String getRole(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("roles", String.class);
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("getRole 토큰 파싱 오류: " + e.getMessage());
            return null;
        }
    }

    // JWT의 만료 시간(exp) 검사
    public Boolean isExpired(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getExpiration()
                    .before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("isExpired 토큰 파싱 오류: " + e.getMessage());
            return true;
        }
    }

    //  기존 시그니처 유지 (subject는 못 넣음 — 레거시 용도로 그대로 둠)
    public String createJwt(String username, String nickname, String role, Long expiredMs) {
        return Jwts.builder()
                .claim("username", username)
                .claim("nickname", nickname)
                .claim("roles", role.replace("ROLE_", "")) // USER,ADMIN 형태로 저장
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiredMs))
                .signWith(secretKey)
                .compact();
    }

    // ✅ PK 기반 발급 경로: subject=PK를 넣고, 기존 클레임도 그대로 유지
    public String generateToken(MemberVO user) {
        String username = user.getSocialId() != null ? user.getSocialId() : user.getLoginid();
        String nickname = user.getNickname();
        String role = user.getRoles(); // 예: ROLE_MENTOR 또는 ROLE_USER 등

        String subjectUserId = String.valueOf(user.getUserId()); // PK를 subject에 저장 (getUserId() 이름 확인)

        long expiredMs = 1000L * 60 * 60 * 24; // 1일
        return Jwts.builder()
                .subject(subjectUserId) // ✅ subject = PK
                .claim("username", username)
                .claim("nickname", nickname)
                .claim("roles", role.replace("ROLE_", "")) // USER,ADMIN 형태로 저장
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiredMs))
                .signWith(secretKey)
                .compact();
    }
}
