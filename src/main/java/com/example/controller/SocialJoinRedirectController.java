package com.example.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("/auth")
public class SocialJoinRedirectController {

    @GetMapping("/social-join")
    public RedirectView redirectToFrontendSocialJoinPage(
        @RequestParam String provider,    // "NAVER", "GOOGLE", "KAKAO"
        @RequestParam String socialId,
        @RequestParam String email,
        @RequestParam(required = false) String birthday,
        @RequestParam(required = false) String gender,
        @RequestParam(required = false) String phone
    ) {
        String frontendUrl = "https://34.64.84.23::8888/auth/social-join" +
            "?provider=" + provider +
            "&socialId=" + socialId +
            "&email=" + email +
            
            "&birthday=" + birthday +
            "&gender=" + gender +
            "&phone=" + phone;

        return new RedirectView(frontendUrl);
    }
}


