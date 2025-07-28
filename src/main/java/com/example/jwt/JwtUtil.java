package com.example.jwt;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;

@Component // Spring에서 Bean으로 등록되어 DI 대상이 됨
public class JwtUtil {

    private final SecretKey secretKey;

    // HS256 키는 JWT 토큰의 위조를 방지하기 위해 사용되는 서명 키
    // HS256은 HMAC-SHA256 알고리즘을 의미하며, 다음과 같은 목적과 특징을 가진다.
    // JWT는 JWT는 다음 3부분으로 구성 : 헤더(Header).페이로드(Payload).서명(Signature)
    
    
    // 생성자에서 application.properties의 시크릿 값을 읽어 HS256 키로 변환
    public JwtUtil(@Value("${spring.jwt.secret}") String secret) {
        this.secretKey = new SecretKeySpec(
            secret.getBytes(StandardCharsets.UTF_8), // UTF-8로 인코딩
            Jwts.SIG.HS256.key().build().getAlgorithm() // HS256 알고리즘 키 설정
        );
    }

    // JWT에서 "username" 클레임 추출
    public String getUsername(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey) // 비밀 키로 서명 검증
                    .build()
                    .parseSignedClaims(token) // 유효한 서명인지 확인
                    .getPayload()
                    .get("username", String.class);
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("getUsername 토큰 파싱 오류: " + e.getMessage());
            return null;
        }
    }

    // JWT에서 "roles" 클레임 추출 (예: ROLE_USER,ROLE_ADMIN)
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
                    .before(new Date()); // 현재 시간보다 이전이면 만료
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("isExpired 토큰 파싱 오류: " + e.getMessage());
            return true; // 오류 발생 시 만료된 것으로 처리
        }
    }

    // JWT 생성 메서드: username, roles, 만료 시간(ms 단위) 입력
    public String createJwt(String username, String role, Long expiredMs) {
        return Jwts.builder()
                .claim("username", username) // 사용자명
                .claim("roles", role)        // 권한 목록
                .issuedAt(new Date(System.currentTimeMillis())) // 발급 시간
                .expiration(new Date(System.currentTimeMillis() + expiredMs)) // 만료 시간
                .signWith(secretKey) // 서명
                .compact(); // JWT 문자열로 압축
    }
}
