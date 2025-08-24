// src/main/java/com/example/controller/SocialLinkController.java
package com.example.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;                              // ★ 추가
import com.example.dto.SocialLinkDTO;
import com.example.dto.SocialLinkResponse;
import com.example.service.SocialLinkService;
import com.example.service.UserService;           // ★ 추가 (또는 UserRepository 써도 됨)

//ㅅㅂ 왜케 안되지
@RestController
@RequestMapping("/api/auth")
public class SocialLinkController {

    private final SocialLinkService linkService;
    private final UserService userService;       // ★ 추가

    public SocialLinkController(SocialLinkService linkService,
                                UserService userService) { // ★ 추가
        this.linkService = linkService;
        this.userService = userService;          // ★ 추가
    }

    // ★★★ 추가: 전화번호 존재 여부 체크 (모달이 호출)
    @GetMapping("/check-phone")
    public ResponseEntity<Map<String, Boolean>> checkPhone(@RequestParam String phone) {
        boolean exists = userService.existsByPhone(phone); // UserService에 메서드 추가/구현 필요
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @PostMapping("/social-link")
    public ResponseEntity<SocialLinkResponse> link(@RequestBody SocialLinkDTO dto) {
        if (isBlank(dto.getLoginId()) || isBlank(dto.getPassword()) ||
            isBlank(dto.getSocialType()) || isBlank(dto.getSocialId())) {
            return ResponseEntity.badRequest().body(new SocialLinkResponse(false, "필수값 누락"));
        }
        SocialLinkResponse res = linkService.link(dto);
        return ResponseEntity.ok(res);
    }

    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
}
