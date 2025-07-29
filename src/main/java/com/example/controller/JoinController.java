package com.example.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    public JoinController(JoinService joinService) {
        this.joinService = joinService;
    }

    @PostMapping(value = "/api/join", consumes = "multipart/form-data")
    public String joinProcess(
        @RequestPart("joinDTO") JoinDTO joinDTO,
        @RequestPart(value = "graduation_file", required = false) MultipartFile graduationFile
    ) {
        if ("MENTOR".equalsIgnoreCase(joinDTO.getRoles())) {
            if (graduationFile == null || graduationFile.isEmpty()) {
                throw new IllegalArgumentException("멘토는 졸업증명서 파일을 반드시 업로드해야 합니다.");
            }
        }

        joinDTO.setGraduationFile(graduationFile != null && !graduationFile.isEmpty() ? graduationFile : null);
        joinService.joinProcess(joinDTO);
        return "회원가입 성공";
    }

    // 파일 단독 업로드용 API는 joinProcess() 밖에 별도 메서드로 작성
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        joinService.saveFile(file);
        return ResponseEntity.ok("파일 업로드 성공");
    }
}