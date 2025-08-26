// src/main/java/com/example/controller/SocialLinkController.java
package com.example.controller;

import java.util.Map;                              // ★ 추가
import java.util.HashMap;      // ✅ 추가
import java.util.UUID;        // ✅ 추가


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<Map<String, Object>> checkPhone(@RequestParam String phone) {
        boolean exists = userService.existsByPhone(phone);
        Map<String, Object> res = new HashMap<>();
        res.put("exists", exists);

        if (exists) {
            String linkTicket = UUID.randomUUID().toString();
            res.put("linkTicket", linkTicket);
        } // ✅ ← 이 중괄호가 빠져 있었음

        return ResponseEntity.ok(res);
    }
            

    @PostMapping("/social-link")
    public ResponseEntity<SocialLinkResponse> link(@RequestBody SocialLinkDTO dto) {
    	 // 📌 디버깅 로그
        System.out.println(">>> loginId = " + dto.getLoginId());
        System.out.println(">>> password = " + dto.getPassword());
        System.out.println(">>> socialType = " + dto.getSocialType());
        System.out.println(">>> socialId = " + dto.getSocialId());
        System.out.println(">>> phone = " + dto.getPhone());
        System.out.println(">>> linkTicket = " + dto.getLinkTicket());  // ← 핵심 포인트!
        
        if (isBlank(dto.getLoginId()) || isBlank(dto.getPassword()) ||
            isBlank(dto.getSocialType()) || isBlank(dto.getSocialId())) {
            return ResponseEntity.badRequest().body(new SocialLinkResponse(false, "필수값 누락"));
        }
        SocialLinkResponse res = linkService.link(dto);
        return ResponseEntity.ok(res);
    }

    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
}
