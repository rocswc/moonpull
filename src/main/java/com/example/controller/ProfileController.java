package com.example.controller;

import com.example.dto.MemberProfileUpdateDTO;
import com.example.VO.MemberVO;
import com.example.DAO.UserRepository;
import com.example.security.CustomUserDetails;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.Map;

@RestController
@RequestMapping("/api/profile") //공통 url
public class ProfileController {

    private final UserRepository userRepository; //final 생성자에서 초기화 되도 객체 변경안됨 타입/변수
    private final PasswordEncoder passwordEncoder;

    public ProfileController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;  //멤버변수/매개변수
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 🔐 프로필 수정 (인증 필요)
     */
    @PostMapping("/update")
    public ResponseEntity<String> updateProfile(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @RequestBody MemberProfileUpdateDTO request
    ) //@AuthenticationPrincipal 로그인한 사용자의 정보 /  @RequestBody 모든객체를 받아와야해서 dto     @RequestParam 쿼리 파라미터 하나만 받을 때
    {
        Integer userId = userDetails.getUserId(); //현재 로그인한 사용자의 userId(PK)를 가져오는code

        return userRepository.findById(userId).map(user -> {
            user.setEmail(request.getEmail());
            user.setPhonenumber(request.getPhone());

            String newPassword = request.getNewPassword();
            if (newPassword != null && !newPassword.isBlank()) { //새로운 비밀번호가 있다면 isblank 공백이 섞여 있는 문자열 저장됨
                user.setPasswordhash(passwordEncoder.encode(newPassword)); // 비밀번호를 해시하는 함수
            }

            userRepository.save(user);
            return ResponseEntity.ok("프로필이 수정되었습니다.");
        }).orElse(ResponseEntity.badRequest().body("해당 사용자를 찾을 수 없습니다."));
    }
    // DB에서 로그인한 사용자 찾기	map(user ->{}사용자 있으면 값 수정 후 저장	orElse 사용자 없으면 오류
    
    
    /**
     * 📧 이메일 중복 확인
     */
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = userRepository.existsByEmail(email);
        return ResponseEntity.ok(Map.of("available", !exists)); //available = true이면 이메일은 가능
    }

    /**
     * 📱 전화번호 중복 확인
     */
    @GetMapping("/check-phone")
    public ResponseEntity<Map<String, Boolean>> checkPhone(@RequestParam String phone) {
        boolean exists = userRepository.existsByPhonenumber(phone);
        return ResponseEntity.ok(Map.of("available", !exists));
    }
}
