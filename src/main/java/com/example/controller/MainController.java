package com.example.controller;

import java.util.Collection;
import java.util.Iterator;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@ResponseBody // 모든 메서드에서 return 값을 그대로 응답으로 사용 
public class MainController {

    @GetMapping("/") // 루트 URL로 접근 시 실행
    public String mainp() {
        //  현재 인증된 사용자의 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 사용자 이름(username) 추출
        String username = authentication.getName(); // 예: "admin"

        // 권한 목록(ROLE_USER, ROLE_ADMIN 등) 추출
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Iterator<? extends GrantedAuthority> iter = authorities.iterator();
        String roles = "";

        //  권한들을 문자열로 이어붙이기
        while (iter.hasNext()) {
            GrantedAuthority auth = iter.next();
            roles += auth.getAuthority() + " ";
        }

        //  결과 문자열 반환
        return "Main Controller : " + username + " / " + roles.trim();
        // 예시 출력: "Main Controller : admin / ROLE_ADMIN"
    }
}
