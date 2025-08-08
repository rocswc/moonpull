package com.example.controller;

// GoogleLoginController.java

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpServletResponse;

@Controller
public class GoogleLoginController {

    @Value("${oauth.google.client-id}")
    private String clientId;

    @Value("${oauth.google.redirect-uri}")
    private String redirectUri;

    @GetMapping("/auth/google/login")
    public void googleLogin(HttpServletResponse response) throws IOException {
        String redirectUriEncoded = URLEncoder.encode(redirectUri, StandardCharsets.UTF_8);
        String scope = URLEncoder.encode("openid email profile", StandardCharsets.UTF_8);

        String url = "https://accounts.google.com/o/oauth2/v2/auth"
                + "?response_type=code"
                + "&client_id=" + clientId
                + "&redirect_uri=" + redirectUriEncoded
                + "&scope=" + scope
                + "&access_type=offline"
                + "&prompt=consent"; // (선택)

        response.sendRedirect(url);
    }
}
