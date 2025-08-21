package com.example.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.DAO.MemberSocialRepository; // ⬅ 추가
import com.example.DAO.UserRepository;
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
    private final UserRepository userRepository;
    private final MemberSocialRepository memberSocialRepository;

    public JoinController(JoinService joinService, UserRepository userRepository, MemberSocialRepository memberSocialRepository){
				this.joinService = joinService;
				this.userRepository = userRepository;
				this.memberSocialRepository = memberSocialRepository;    // ⬅ 추가
				}

    // 회원가입 처리 API (multipart/form-data)
    @PostMapping(value = "/api/join", consumes = "multipart/form-data")
    public ResponseEntity<?> joinProcess(
        @RequestPart("joinDTO") JoinDTO joinDTO,
        @RequestPart(value = "graduation_file", required = false) MultipartFile graduationFile
    ) {
        try {
            // 전화번호 중복 검사
            if (userRepository.existsByPhonenumber(joinDTO.getPhoneNumber().replace("-", ""))) {
                return ResponseEntity.badRequest().body(Map.of("error", "이미 가입한 회원입니다."));
            }
            
            //   이메일 중복 검사
            if (userRepository.existsByEmail(joinDTO.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "이미 가입된 이메일입니다."));
            }
            
            //   일반 로그인 ID 중복 검사 (NULL 아닌 경우에만 검사)
            if (joinDTO.getLoginId() != null && userRepository.existsByLoginid(joinDTO.getLoginId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "이미 사용 중인 로그인 ID입니다."));
            }

            //  소셜 로그인 ID 중복 검사
         // 변경 후
            if (Boolean.TRUE.equals(joinDTO.getIsSocial()) &&
                memberSocialRepository.existsBySocialTypeAndSocialId(joinDTO.getSocialType(), joinDTO.getSocialId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "이미 가입된 소셜 계정입니다."));
            }

            // 멘토인 경우 졸업증명서 필수
            if ("MENTOR".equalsIgnoreCase(joinDTO.getRoles())) {
                if (graduationFile == null || graduationFile.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "멘토는 졸업증명서 파일을 반드시 업로드해야 합니다."));
                }
            }

            // 파일 DTO에 설정
            joinDTO.setGraduationFile(graduationFile != null && !graduationFile.isEmpty() ? graduationFile : null);

            // 회원가입 로직 실행
            joinService.joinProcess(joinDTO);

            return ResponseEntity.ok().body(Map.of("message", "회원가입 성공"));
        } catch (Exception e) {
        	
        	 System.err.println("🚨 [JOIN ERROR] " + e.getClass().getName() + ": " + e.getMessage());
             e.printStackTrace(); // 전체 스택트레이스
            return ResponseEntity.internalServerError().body(Map.of("error", "서버 오류: " + e.getMessage()));
        }
    }

    // 단일 파일 업로드 테스트용 API
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        joinService.saveFile(file);
        return ResponseEntity.ok("파일 업로드 성공");
    }

    // login_id, email, nickname, phone_number 중복 확인 API
    @GetMapping("/api/check-duplicate")
    public ResponseEntity<?> checkDuplicate(
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String value
    ) {
        System.out.println(" 중복확인 요청: type=" + type + ", value=" + value);

        if (type == null || value == null || value.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "type이나 value가 비었습니다."));
        }

        try {
            boolean exists = switch (type) {
                case "login_id" -> userRepository.existsByLoginid(value);
                case "email" -> userRepository.existsByEmail(value);
                case "nickname" -> userRepository.existsByNickname(value);
                case "phone_number" -> userRepository.existsByPhonenumber(value);
                default -> throw new IllegalArgumentException("지원하지 않는 타입: " + type);
            };

            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "서버 오류 발생"));
        }
    }
}
