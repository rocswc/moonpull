package com.example.controller;

import java.time.Duration;
import java.util.Optional;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.VO.MemberVO;
import com.example.jwt.JwtUtil;
import com.example.service.UserService;

@RestController
@RequestMapping("/auth/social")
public class SocialFinalizeController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public SocialFinalizeController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/finalize")
    public ResponseEntity<Void> finalizeLogin(@RequestBody SocialFinalizeReq req) {
        // Optional 반환이 전제입니다.
        Optional<MemberVO> opt = userService.getBySocialIdAndType(req.socialId(), req.provider());
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        MemberVO m = opt.get();
        String jwt = jwtUtil.generateToken(m); // ★ sub = m.getId() 여야 /api/user 통과

        ResponseCookie cookie = ResponseCookie.from("jwt", jwt)
                .httpOnly(true)
                .secure(true)           // SameSite=None이면 HTTPS 필수
                .sameSite("None")
                .path("/")
                .maxAge(Duration.ofDays(7))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    // JDK 17
    public record SocialFinalizeReq(String provider, String socialId, String state) {}
}
