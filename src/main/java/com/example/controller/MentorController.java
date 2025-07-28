package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import com.example.jwt.JwtUtil;
import com.example.security.CustomUserDetails;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/apply")
public class MentorController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PreAuthorize("hasAnyRole('MENTEE', 'ADMIN')")
    @PostMapping("/mentor")
    public ResponseEntity<String> applyForMentor(HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();

        MemberVO user = userRepository.findByLoginid(userDetails.getUsername())
        	    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저 없음"));

        user.setRoles("ROLE_MENTOR");
        userRepository.save(user);

        String newToken = jwtUtil.createJwt(user.getLoginid(), user.getRoles(), 1000 * 60 * 60L); // 1시간

        Cookie cookie = new Cookie("jwt", newToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60);
        response.addCookie(cookie);

        return ResponseEntity.ok("멘토 신청 완료 / 권한 변경 및 토큰 재발급 완료");
    }
}
