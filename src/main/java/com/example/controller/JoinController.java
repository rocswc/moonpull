package com.example.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.dto.JoinDTO;
import com.example.service.JoinService;

@CrossOrigin(origins = {
	    "http://localhost:8888",
	    "http://127.0.0.1:8888",
	    "http://192.168.56.1:8888"
	}, allowCredentials = "true")
@RestController
public class JoinController {

    private final JoinService joinService;

    // 생성자 기반 의존성 주입
    public JoinController(JoinService joinService) {
        this.joinService = joinService;
    }

    // 회원 가입 처리 엔드포인트 (POST /join)
    @PostMapping(value = "/api/join", consumes = "multipart/form-data")
    public String joinProcess(
        @RequestPart("joinDTO") JoinDTO joinDTO,
        @RequestPart(value = "graduation_file", required = false) MultipartFile graduationFile
    ) {
        joinDTO.setGraduationFile(graduationFile);
        joinService.joinProcess(joinDTO);
        return "회원가입 성공";
    }

}
