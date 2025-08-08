package com.example.controller;

import com.example.DAO.MentorRepository;
import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import com.example.VO.MentorVO;
import com.example.dto.BanRequestDTO;
import com.example.service.PaymentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;

import com.example.security.CustomUserDetails;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
	
	
	

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MentorRepository mentorRepository;
    
    @Autowired
    private PaymentService paymentService;

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
    
    
    
    @GetMapping("/payments/total-amount")
    public Long getTotalPaymentAmount() {
        Long totalAmount = mentorRepository.getTotalAmount();
        System.out.println("총 결제액: " + totalAmount);
        return totalAmount == null ? 0L : totalAmount;
    }
    
    
    @GetMapping("/payments/total-count")
    public int getTotalPaymentCount() {
        return mentorRepository.getTotalPaymentCount();
    }

    
    
    @GetMapping("/subscriptions/count")
    public int getSubscribedUserCount() {
        return mentorRepository.getSubscribedUserCount();
    }
    
    @GetMapping("/subscriptions/conversion-rate")
    public double getSubscriptionConversionRate() {
        return mentorRepository.getSubscriptionConversionRate();
    }
    
    @GetMapping("/payments/daily-revenue")
    public List<Map<String, Object>> getDailyRevenue() {
        return mentorRepository.getDailyRevenue();
    }

    
    @GetMapping("/payments/recent")
    public List<Map<String, Object>> getRecentPaidUsers() {
        return mentorRepository.getRecentPaidUsers();
    }
    
    @PostMapping("/subscription/cancel-direct")
    public ResponseEntity<String> cancelDirect(
        @RequestBody Map<String, Object> payload) {

        int subscribeId = (int) payload.get("subscribeId");
        int memberId = (int) payload.get("memberId");

        System.out.println("✅ cancel-direct 호출됨: subscribeId=" + subscribeId + ", memberId=" + memberId);
        try {
            paymentService.cancelSubscriptionAndPayment(subscribeId, memberId);
            return ResponseEntity.ok("구독 및 결제 취소 완료");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("취소 실패: " + e.getMessage());
        }
    }

    
    
    @GetMapping("/subscriptions/plan-distribution")
    public ResponseEntity<List<Map<String, Object>>> getPlanDistribution() {
        List<Map<String, Object>> result = paymentService.getPlanDistribution();
        return ResponseEntity.ok(result);
    }
    
    
    @PostMapping("/ban-user")
    @Transactional
    public ResponseEntity<String> banUser(
        @RequestBody BanRequestDTO request,
        @AuthenticationPrincipal CustomUserDetails adminUser
    ) {
        try {
            // ① 관리자 정보 확인
            int bannedBy = adminUser.getUserId();
            System.out.println("✅ 로그인한 관리자 ID: " + bannedBy);

            // ② loginId 확인
            System.out.println("📥 들어온 로그인 ID: " + request.getLoginId());
            Optional<MemberVO> memberOpt = userRepository.findByLoginid(request.getLoginId());

            if (memberOpt.isEmpty()) {
                System.out.println("❌ 해당 loginId 사용자를 찾을 수 없음");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 loginId 사용자 없음");
            }

            int userId = memberOpt.get().getUserId();
            System.out.println("✅ 대상 사용자 ID: " + userId);

            // ③ 로그인 차단 처리
            mentorRepository.banUserByUserId(userId);
            System.out.println("✅ 사용자 is_banned true 처리 완료");

            // ④ 로그 데이터 구성
            Map<String, Object> logData = new HashMap<>();
            logData.put("userId", userId);
            logData.put("bannedBy", bannedBy);
            logData.put("reasonCode", request.getReasonCode());
            logData.put("reasonDetail", request.getReasonDetail());
            logData.put("durationDays", request.getBanDays());
          

            System.out.println("📄 로그 데이터: " + logData);

            // ⑤ 로그 삽입
            mentorRepository.insertBlacklistLog(logData);
            System.out.println("✅ 블랙리스트 로그 삽입 완료");

         // 🔥 사용자 차단 + 사유/만료일 반영
            Map<String, Object> updateData = new HashMap<>();
            updateData.put("userId", userId);
            updateData.put("banReason", request.getReasonDetail());
            updateData.put("banExpireDate", request.getEndDate());

            mentorRepository.banUserByUserIdWithReason(updateData);
            System.out.println("✅ 사용자 차단 정보(사유/기간 포함) 업데이트 완료");
            
            
            return ResponseEntity.ok("✅ 블랙리스트 등록 완료");

        } catch (Exception e) {
            System.err.println("❌ 예외 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("블랙리스트 등록 실패: " + e.getMessage());
        }
    }


    
    @PostMapping("/unban-user/{userId}")
    public ResponseEntity<String> unbanUser(@PathVariable int userId) {
        try {
            mentorRepository.unbanUserByUserId(userId);
            return ResponseEntity.ok("블랙리스트 해제 완료");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("해제 실패: " + e.getMessage());
        }
    }
    
    
    



}
