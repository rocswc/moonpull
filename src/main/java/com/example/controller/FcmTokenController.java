package com.example.controller;

import com.example.dto.RegisterReq;
import com.example.dto.UnregisterReq;
import com.example.service.FcmTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/fcm")
@RequiredArgsConstructor
public class FcmTokenController {

    private final FcmTokenService service;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterReq req) {
    	System.out.println("👉 받은 userId=" + req.getUserId() + ", token=" + req.getToken());
        service.register(req.getUserId(), req.getToken());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/unregister")
    public ResponseEntity<Void> unregister(@RequestBody UnregisterReq req) {
    	System.out.println("👉 받은 token=" + req.getToken());
        service.unregister(req.getToken());
        return ResponseEntity.ok().build();
    }
}
