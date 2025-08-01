package com.example.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.security.CustomUserDetails;

@RestController
public class UserController {

    @GetMapping("/api/user") // or "/api/me"
    public ResponseEntity<?> me(@AuthenticationPrincipal CustomUserDetails user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 안됨");
        }
        Map<String, Object> body = new HashMap<>();
        body.put("loginId", user.getUsername());
        body.put("roles", user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        return ResponseEntity.ok(body);
    }
}