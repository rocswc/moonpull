package com.example.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth/google")
public class GoogleLoginController {

    @Value("${oauth.google.client-id}")
    private String clientId;

    @Value("${oauth.google.redirect-uri}")
    private String redirectUri;

    @GetMapping("/login")
    public ResponseEntity<?> redirectToGoogleLogin() {
        String scope = "openid%20email%20profile";
        String responseType = "code";

        String url = String.format(
            "https://accounts.google.com/o/oauth2/v2/auth?client_id=%s&redirect_uri=%s&response_type=%s&scope=%s",
            clientId, redirectUri, responseType, scope
        );

        return ResponseEntity.status(302).header("Location", url).build();
    }
}


