package com.example.controller;

import com.example.dto.ResetPasswordRequestDTO;
import com.example.dto.ResetPasswordConfirmDTO;
import com.example.service.EmailService;
import com.example.service.PasswordResetService;
import com.example.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/password-reset")
@RequiredArgsConstructor
public class PasswordResetController {

    private final EmailService emailService;
    private final PasswordResetService passwordResetService;
    private final UserService userService;

    /**
     * 🔐 비밀번호 재설정 메일 요청
     * POST /api/password-reset/request
     */
    @PostMapping("/request")
    public ResponseEntity<?> requestReset(@RequestBody ResetPasswordRequestDTO dto) {
        String email = dto.getEmail();

        // 1. 이메일 유효성 검사
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "이메일을 입력해주세요."));
        }

        // 2. 너무 자주 요청한 경우 차단
        if (passwordResetService.isRateLimited(email)) {
            return ResponseEntity.status(429).body(Map.of("error", "잠시 후 다시 시도해주세요."));
        }

        // 3. 토큰 생성 + 이메일 발송
        String token = passwordResetService.createResetToken(email); // 30분 유효
        emailService.sendResetPasswordEmail(email, token);

        return ResponseEntity.ok(Map.of("message", "비밀번호 재설정 메일이 발송되었습니다."));
    }

    /**
     * 🔐 비밀번호 재설정 완료
     * POST /api/password-reset/confirm
     */
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmReset(@RequestBody ResetPasswordConfirmDTO dto) {
        String token = dto.getToken();
        String newPassword = dto.getPassword();

        // 1. 입력값 검사
        if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "토큰과 새 비밀번호를 모두 입력해주세요."));
        }

        // 2. 토큰 유효성 검증
        String email;
        try {
            email = passwordResetService.verifyToken(token); // 없거나 만료되면 예외 발생
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", "유효하지 않은 또는 만료된 토큰입니다."));
        }

        // 3. 비밀번호 업데이트
        userService.updatePasswordByEmail(email, newPassword);  // 내부에서 해시 처리

        // 4. 토큰 무효화
        passwordResetService.invalidateToken(token);

        return ResponseEntity.ok(Map.of("message", "비밀번호가 성공적으로 변경되었습니다."));
    }
}
