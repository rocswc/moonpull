package com.example.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    private final StringRedisTemplate redisTemplate;

    private static final long EXPIRATION_MINUTES = 30;       // 토큰 유효 시간
    private static final long RATE_LIMIT_SECONDS = 60;       // 요청 제한 시간 (1분)

    // ===== 1. 토큰 생성 =====
    @Override
    public String createResetToken(String email) {
        checkRequestRateLimit(email); // ✅ 여기서 호출
        String token = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(
            "password-reset:" + token,
            email,
            EXPIRATION_MINUTES,
            TimeUnit.MINUTES
        );
        return token;
    }

    // ===== 2. 토큰으로 이메일 조회 =====
    @Override
    public String getEmailByToken(String token) {
        return redisTemplate.opsForValue().get("password-reset:" + token);
    }

    // ===== 3. 토큰 무효화 =====
    @Override
    public void invalidateToken(String token) {
        redisTemplate.delete("password-reset:" + token);
    }

    // ===== 4. 토큰 유효성 검사 =====
    @Override
    public String verifyToken(String token) {
        String email = getEmailByToken(token);
        if (email == null) {
            throw new IllegalArgumentException("토큰이 유효하지 않거나 만료되었습니다.");
        }
        return email;
    }

    // ===== 5. 요청 제한 확인 =====
    @Override
    public boolean isRateLimited(String email) {
        return Boolean.TRUE.equals(redisTemplate.hasKey("password-reset-rl:" + email));
    }

    @Override
    public void incrementRateLimit(String email) {
        redisTemplate.opsForValue().set(
            "password-reset-rl:" + email,
            "1",
            RATE_LIMIT_SECONDS,
            TimeUnit.SECONDS
        );
    }

    @Override
    public void checkRequestRateLimit(String email) {
        if (isRateLimited(email)) {
            throw new IllegalStateException("비밀번호 재설정 요청은 잠시 후 다시 시도해주세요.");
        }
        incrementRateLimit(email);
    }
}
