package com.example.controller;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpServletResponse;

//KakaoLoginController.java
@Controller
public class KakaoLoginController {

 @Value("${oauth.kakao.client-id}")
 private String kakaoClientId;

 @Value("${oauth.kakao.redirect-uri}")
 private String kakaoRedirectUri;

 @GetMapping("/auth/kakao/login")
 public void kakaoLogin(HttpServletResponse response) throws IOException {
     String redirectUriEncoded = URLEncoder.encode(kakaoRedirectUri, StandardCharsets.UTF_8);
     String scope = URLEncoder.encode("account_email profile_nickname profile_image", StandardCharsets.UTF_8);

     String url = "https://kauth.kakao.com/oauth/authorize?response_type=code"
                + "&client_id=" + kakaoClientId
                + "&redirect_uri=" + redirectUriEncoded
                + "&scope=" + scope;

     response.sendRedirect(url);
 }
}

