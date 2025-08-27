package com.example.service;

public interface PasswordResetService {
    String createResetToken(String email);
    String getEmailByToken(String token);
    void invalidateToken(String token);

    // ✅ 새로 추가
    String verifyToken(String token);                // ← 이메일 없으면 예외 발생
    boolean isRateLimited(String email);             // ← 중복 요청 방지
    void incrementRateLimit(String email);           // ← 요청 카운트 증가 (optional)
    void checkRequestRateLimit(String email);        // ← 요청 수 + TTL 검증
}
