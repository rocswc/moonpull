package com.example.controller;

import com.example.dto.MemberProfileUpdateDTO;
import com.example.VO.MemberVO;
import com.example.DAO.UserRepository;
import com.example.security.CustomUserDetails;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 🔐 프로필 수정 (인증 필요)
     */
    @PostMapping("/update")
    public ResponseEntity<String> updateProfile(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @RequestBody MemberProfileUpdateDTO request
    ) {
        Integer userId = userDetails.getUserId();

        return userRepository.findById(userId).map(user -> {
            user.setEmail(request.getEmail());
            user.setPhonenumber(request.getPhone());

            String newPassword = request.getNewPassword();
            if (newPassword != null && !newPassword.isBlank()) {
                user.setPasswordhash(passwordEncoder.encode(newPassword));
            }

            userRepository.save(user);
            return ResponseEntity.ok("프로필이 수정되었습니다.");
        }).orElse(ResponseEntity.badRequest().body("해당 사용자를 찾을 수 없습니다."));
    }

    /**
     * 📧 이메일 중복 확인
     */
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = userRepository.existsByEmail(email);
        return ResponseEntity.ok(Map.of("available", !exists));
    }

    /**
     * 📱 전화번호 중복 확인
     */
    @GetMapping("/check-phone")
    public ResponseEntity<Map<String, Boolean>> checkPhone(@RequestParam String phone) {
        boolean exists = userRepository.existsByPhonenumber(phone);
        return ResponseEntity.ok(Map.of("available", !exists));
    }
}
