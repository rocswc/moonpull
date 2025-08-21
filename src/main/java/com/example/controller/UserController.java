package com.example.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.DAO.UserRepository;
import com.example.security.CustomUserDetails;

@RestController
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/api/user")
    public ResponseEntity<?> me(@AuthenticationPrincipal CustomUserDetails user) {
        System.out.println(" 현재 로그인 유저: " + user); // <-- 이 라인 추가

        if (user == null) {
            System.out.println(" 인증 객체가 없습니다!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 안됨");
        }

        System.out.println("nickname: " + user.getNickname());

        Map<String, Object> body = new HashMap<>();
        body.put("userId", user.getUserId());             // ✅ 프론트에서 필수
        body.put("name", user.getNickname()); 
        body.put("loginId", user.getUsername());
        body.put("nickname", user.getNickname());
        body.put("user", user.getMemberVO());
        body.put("roles", user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        return ResponseEntity.ok(body);
    }

 // ✅ 중복 피하기 위해 경로 변경
    @GetMapping("/check-phone")
    public ResponseEntity<?> checkPhoneExists(@RequestParam("phone") String phone) {
        boolean exists = userRepository.existsByPhonenumber(phone);
        return ResponseEntity.ok(Map.of("exists", exists));
    }
}
