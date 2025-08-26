package com.example.controller;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.VO.MemberVO;
import com.example.jwt.JwtUtil;

@RestController
@RequestMapping("/auth")
public class CookieBridgeController {

    private final JwtUtil jwtUtil;

    public CookieBridgeController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/bridge")
    public ResponseEntity<Void> bridge(@RequestParam String ticket) {
        MemberVO m = jwtUtil.verifyBridgeTicket(ticket);
        String jwt = jwtUtil.generateToken(m);

        ResponseCookie jwtCookie = ResponseCookie.from("jwt", jwt)
            .httpOnly(true).secure(true).sameSite("None").path("/").maxAge(60L * 60 * 24 * 7).build();

        ResponseCookie clearJwtLocalhost = ResponseCookie.from("jwt", "")
            .domain("localhost").httpOnly(true).secure(true).sameSite("None").path("/").maxAge(0).build();

        // ✅ domain 없는 SESSION 삭제용 쿠키 (오직 이거 하나만!)
        ResponseCookie clearSession = ResponseCookie.from("SESSION", "")
            .httpOnly(true).secure(true).sameSite("None").path("/").maxAge(0).build();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, jwtCookie.toString());
        headers.add(HttpHeaders.SET_COOKIE, clearJwtLocalhost.toString());
        headers.add(HttpHeaders.SET_COOKIE, clearSession.toString()); // ✅ 이것만!

        headers.setLocation(URI.create("https://192.168.56.1:8080/post-bridge"));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

}





