package com.example.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.JoinDTO;
import com.example.service.JoinService;

@RestController
public class JoinController {

    private final JoinService joinService;

    // 생성자 기반 의존성 주입 (권장 방식)
    public JoinController(JoinService joinService) {
        this.joinService = joinService;
    }

    // 회원 가입 처리 엔드포인트 (POST /join)
    @PostMapping("/join")
    public String joinProcess(@RequestBody JoinDTO joinDTO) {
        // 로그인 ID 출력 (디버깅용)
        System.out.println("회원가입 ID: " + joinDTO.getLoginid());

        // JoinService를 통해 회원 가입 로직 실행
        joinService.joinProcess(joinDTO);

        // 응답 문자열 반환
        return "회원가입 성공 ";
    }
}
