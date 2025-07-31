package com.example.controller;

import com.example.DAO.MentorRepository;
import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import com.example.VO.MentorVO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MentorRepository mentorRepository;

    // ✅ 전체 사용자 목록 조회
    @GetMapping("/users")
    public List<MemberVO> getAllUsers() {
        return mentorRepository.getAllUsers();  // mapper에 구현된 getAllUsers 사용
    }

    // ✅ 멘토 인증 요청 목록 조회 (PENDING 상태)
    @GetMapping("/mentor-requests")
    public List<MentorVO> getMentorRequests() {
        return mentorRepository.getAllMentorApplications();  // status = 'PENDING'
    }

    // ✅ 멘토 권한 부여
    @PostMapping("/mentor/approve/{userId}")
    public String approveMentor(@PathVariable int userId) {
        mentorRepository.approveMentor(userId);
        return "멘토 승인 완료";
    }

    // ✅ 멘토 권한 철회
    @PostMapping("/mentor/revoke/{userId}")
    public String revokeMentor(@PathVariable int userId) {
        mentorRepository.revokeMentor(userId);
        return "멘토 권한 철회 완료";
    }

    // ✅ 멘토 거부 (status만 DENIED로 변경)
    @PostMapping("/mentor/deny/{userId}")
    public String denyMentor(@PathVariable int userId) {
        mentorRepository.denyMentor(userId);
        return "멘토 신청 거부 완료";
    }
    
    @PostMapping("/ban/{userId}")
    public String banUser(@PathVariable int userId) {
        mentorRepository.banUser(userId);
        return "블랙리스트 등록 완료";
    }

    @PostMapping("/unban/{userId}")
    public String unbanUser(@PathVariable int userId) {
        mentorRepository.unbanUser(userId);
        return "블랙리스트 해제 완료";
    }
    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            int userCount = mentorRepository.getUserCount();
            int inactiveUserCount = mentorRepository.getInactiveUserCount();

            stats.put("userCount", userCount);
            stats.put("inactiveUserCount", inactiveUserCount);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("서버 오류: " + e.getMessage());
        }
    }

}
