package com.example.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.SocialLinkDTO;
import com.example.dto.SocialLinkResponse;
import com.example.service.SocialLinkService;

@RestController
@RequestMapping("/api/auth")
public class SocialLinkController {

    private final SocialLinkService linkService;

    public SocialLinkController(SocialLinkService linkService) {
        this.linkService = linkService;
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

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
