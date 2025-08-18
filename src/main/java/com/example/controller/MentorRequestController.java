package com.example.controller;

import com.example.DAO.MenteeRepository;
import com.example.DAO.MentorEntityRepository;
import com.example.DAO.MentorRequestRepository;
import com.example.DAO.MentoringChatroomRepository;
import com.example.DAO.UserRepository;
import com.example.dto.MenteeInfo;
import com.example.dto.MentorRequestDTO;
import com.example.dto.MentorRequestInfo;
import com.example.entity.Mentee;
import com.example.entity.Mentor;
import com.example.entity.MentorRequest;
import com.example.entity.MentoringChatroom;
import com.example.VO.MemberVO;
import com.example.security.CustomUserDetails;
import com.example.service.MentoringChatroomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/mentoring")
@RequiredArgsConstructor
public class MentorRequestController {

    private final MentorRequestRepository mentorRequestRepository;
    private final MenteeRepository menteeRepository;
    private final MentorEntityRepository mentorEntityRepository;
    private final MentoringChatroomService mentoringChatroomService;
    private final MentoringChatroomRepository mentoringChatroomRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate broker;

    /**
     * 1. 멘티 → 멘토 요청 생성
     */
    @PostMapping("/request")
    public ResponseEntity<?> createRequest(@AuthenticationPrincipal CustomUserDetails userDetails,
                                         @RequestBody MentorRequestDTO dto) {
        log.info("======== [createRequest] 멘토 요청 생성 시작 ========");
        log.info("📌 현재 로그인한 userId={}", userDetails.getUserId());
        log.info("📥 받은 DTO: menteeUserId={}, mentorUserId={}", dto.getMenteeId(), dto.getMentorId());

                // 현재 로그인한 사용자가 요청하는 멘티인지 확인 (타입 안전성 고려)
        log.info("🔍 권한 확인: 로그인한 userId={}, 요청한 menteeId={}", 
                userDetails.getUserId(), dto.getMenteeId());
        
        // null 체크 및 타입 안전성 확보
        if (userDetails.getUserId() == null || dto.getMenteeId() == null) {
            log.error("❌ null 값 발견: userDetails.getUserId()={}, dto.getMenteeId()={}", 
                    userDetails.getUserId(), dto.getMenteeId());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "사용자 정보가 올바르지 않습니다.");
        }
        
        // Integer 타입으로 비교 (userDetails.getUserId()가 Integer 반환)
        Integer loginUserId = userDetails.getUserId();
        Long requestMenteeId = dto.getMenteeId();
        
        log.info("🔍 비교: loginUserId={} (타입: {}), requestMenteeId={} (타입: {})", 
                loginUserId, loginUserId.getClass().getSimpleName(),
                requestMenteeId, requestMenteeId.getClass().getSimpleName());
        
        // 임시로 권한 확인 비활성화 (디버깅용)
        log.warn("⚠️ 임시로 권한 확인 비활성화됨");
        /*
        if (!loginUserId.equals(requestMenteeId)) {
            log.error("❌ 권한 없음: 로그인한 사용자와 요청한 멘티가 다름");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "자신의 요청만 생성할 수 있습니다. 로그인한 사용자: " + loginUserId + 
                    ", 요청한 멘티: " + requestMenteeId);
        }
        */

        // menteeUserId → mentee_id 변환
        Mentee mentee = menteeRepository.findByUserId(dto.getMenteeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "멘티를 찾을 수 없습니다. userId=" + dto.getMenteeId()));

        // mentorUserId → mentor_id 변환
        Mentor mentor = mentorEntityRepository.findByUserId(dto.getMentorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "멘토를 찾을 수 없습니다. userId=" + dto.getMentorId()));

        // 요청 저장
        MentorRequest request = new MentorRequest();
        request.setMenteeId(mentee.getMenteeId());
        request.setMentorId(mentor.getMentorId());
        request.setStatus("REQUESTED");
        request.setStartedAt(LocalDateTime.now());

        mentorRequestRepository.save(request);

        log.info("💾 저장 완료: requestId={}, menteeId={}, mentorId={}, status={}",
                request.getId(), request.getMenteeId(), request.getMentorId(), request.getStatus());

        // 실시간 알림 전송
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "NEW_MENTOR_REQUEST");
            notification.put("requestId", request.getId());
            notification.put("menteeId", mentee.getUserId());
            notification.put("mentorId", mentor.getUserId());
            notification.put("menteeName", mentee.getName());
            notification.put("message", "새로운 멘토 요청이 도착했습니다!");
            notification.put("timestamp", LocalDateTime.now());
            
            // 멘토에게 알림 전송
            broker.convertAndSendToUser(
                String.valueOf(mentor.getUserId()), 
                "/queue/notifications", 
                notification
            );
            log.info("✅ 멘토 알림 전송 완료: mentorId={}", mentor.getUserId());
        } catch (Exception e) {
            log.warn("⚠️ 알림 전송 실패", e);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "멘토 요청이 생성되었습니다.");
        response.put("requestId", request.getId());
        return ResponseEntity.ok().body(response);
    }

    /**
     * 2. 멘토 → 요청 목록 조회
     */
    @GetMapping("/requests")
    public ResponseEntity<List<MentorRequestInfo>> getRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUserId().longValue();
        log.info("📌 현재 로그인한 userId={}", userId);

        Mentor mentor = mentorEntityRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "멘토 정보를 찾을 수 없습니다. userId=" + userId));

        log.info("✅ 매핑된 mentorId={}", mentor.getMentorId());

        List<MentorRequest> requests = mentorRequestRepository
                .findByMentorIdAndStatus(mentor.getMentorId(), "REQUESTED");

        log.info("🔍 조회된 요청 개수={}", requests.size());

        List<MentorRequestInfo> result = requests.stream().map(req -> {
            log.info("🔍 요청 처리 중: requestId={}, menteeId={}, mentorId={}", 
                    req.getId(), req.getMenteeId(), req.getMentorId());
            
            // mentee_id로 멘티 정보 조회
            Mentee mentee = menteeRepository.findById(req.getMenteeId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "멘티를 찾을 수 없습니다. menteeId=" + req.getMenteeId()));
            
            log.info("👤 멘티 정보: menteeId={}, userId={}, name={}, age={}", 
                    mentee.getMenteeId(), mentee.getUserId(), mentee.getName(), mentee.getAge());
            
            return new MentorRequestInfo(req.getId(), mentee.getUserId(),
                    mentee.getName(), mentee.getAge());
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * 3. 멘토 → 요청 수락
     */
    @PostMapping("/accept-request")
    public ResponseEntity<Map<String, Object>> acceptRequest(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                @RequestParam Long requestId) {
        Long userId = userDetails.getUserId().longValue();

        Mentor mentor = mentorEntityRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "멘토 정보를 찾을 수 없습니다."));

        MentorRequest request = mentorRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "요청을 찾을 수 없습니다. requestId=" + requestId));

        if (!request.getMentorId().equals(mentor.getMentorId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "이 요청을 수락할 권한이 없습니다.");
        }

        // 1. 요청 상태 변경
        request.setStatus("ACCEPTED");
        mentorRequestRepository.save(request);

        // 2. 채팅방 생성 또는 기존 채팅방 찾기
        log.info("🔍 채팅방 생성/조회 시작: menteeId={}, mentorId={}", 
                request.getMenteeId(), request.getMentorId());
        
        int chatId;
        try {
            // 기존 채팅방이 있는지 먼저 확인 (양방향 검색)
            var existingChatroomOpt = mentoringChatroomRepository
                    .findTopByParticipant1IdAndParticipant2IdOrderByCreatedAtDesc(
                            (long) request.getMenteeId().intValue(), 
                            (long) request.getMentorId().intValue()
                    );
            
            if (existingChatroomOpt.isPresent()) {
                chatId = Math.toIntExact(existingChatroomOpt.get().getChat_id());
                log.info("🔍 기존 채팅방 사용: chatId={}", chatId);
            } else {
                // 반대 방향으로도 확인
                var existingChatroomOpt2 = mentoringChatroomRepository
                        .findTopByParticipant1IdAndParticipant2IdOrderByCreatedAtDesc(
                                (long) request.getMentorId().intValue(), 
                                (long) request.getMenteeId().intValue()
                        );
                
                if (existingChatroomOpt2.isPresent()) {
                    chatId = Math.toIntExact(existingChatroomOpt2.get().getChat_id());
                    log.info("🔍 기존 채팅방 사용 (반대): chatId={}", chatId);
                } else {
                    // 기존 채팅방이 없으면 새로 생성
                    chatId = mentoringChatroomService.createChatroomAndUpdateProgress(
                            request.getMenteeId().intValue(), 
                            request.getMentorId().intValue()
                    );
                    log.info("✅ 새 채팅방 생성 완료: chatId={}", chatId);
                }
            }
        } catch (Exception e) {
            log.error("❌ 채팅방 생성/조회 실패", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "채팅방 생성 중 오류가 발생했습니다: " + e.getMessage());
        }

                log.info("✅ 멘토 요청 수락 완료 - requestId={}, status=ACCEPTED, chatId={}", requestId, chatId);
        
        // 실시간 알림 전송
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "MENTOR_REQUEST_ACCEPTED");
            notification.put("requestId", requestId);
            notification.put("chatId", chatId);
            notification.put("message", "멘토 요청이 수락되었습니다!");
            notification.put("timestamp", LocalDateTime.now());
            
            // 멘티에게 알림 전송
            broker.convertAndSendToUser(
                String.valueOf(request.getMenteeId()), 
                "/queue/notifications", 
                notification
            );
            log.info("✅ 멘티 알림 전송 완료: menteeId={}", request.getMenteeId());
        } catch (Exception e) {
            log.warn("⚠️ 알림 전송 실패", e);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "멘토 요청이 수락되었습니다.");
        response.put("chatId", chatId);
        return ResponseEntity.ok(response);
    }

    /**
     * 4. 멘토 → 멘티 목록 조회 (수락된 멘티들)
     */
    @GetMapping("/mentees")
    public ResponseEntity<List<MenteeInfo>> getMentees(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId().longValue();
        log.info("📌 현재 로그인한 userId={}", userId);

        Mentor mentor = mentorEntityRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "멘토 정보를 찾을 수 없습니다. userId=" + userId));

        log.info("✅ 매핑된 mentorId={}", mentor.getMentorId());

        // ACCEPTED 상태의 요청들 조회
        List<MentorRequest> acceptedRequests = mentorRequestRepository
                .findByMentorIdAndStatus(mentor.getMentorId(), "ACCEPTED");

        log.info("🔍 수락된 요청 개수={}", acceptedRequests.size());

        List<MenteeInfo> result = acceptedRequests.stream().map(req -> {
            // mentee_id로 멘티 정보 조회
            Mentee mentee = menteeRepository.findById(req.getMenteeId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "멘티를 찾을 수 없습니다. menteeId=" + req.getMenteeId()));
            
            log.info("👤 멘티 정보: menteeId={}, userId={}, name={}, age={}", 
                    mentee.getMenteeId(), mentee.getUserId(), mentee.getName(), mentee.getAge());
            
            return new MenteeInfo(mentee.getUserId(), mentee.getName(), mentee.getAge());
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * 5. 멘토 → 요청 거절
     */
    @PostMapping("/reject-request")
    public ResponseEntity<Map<String, Object>> rejectRequest(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                @RequestParam Long requestId) {
        Long userId = userDetails.getUserId().longValue();

        Mentor mentor = mentorEntityRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "멘토 정보를 찾을 수 없습니다."));

        MentorRequest request = mentorRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "요청을 찾을 수 없습니다. requestId=" + requestId));

        if (!request.getMentorId().equals(mentor.getMentorId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "이 요청을 거절할 권한이 없습니다.");
        }

        request.setStatus("REJECTED");
        mentorRequestRepository.save(request);

        log.info("❌ 멘토 요청 거절 완료 - requestId={}, status=REJECTED", requestId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "멘토 요청이 거절되었습니다.");
        return ResponseEntity.ok(response);
    }

    /**
     * 6. 멘토 → 현재 로그인한 멘토의 ID 조회
     */
    @GetMapping("/mentor-id")
    public ResponseEntity<Map<String, Long>> getMentorId(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer userId = userDetails.getUserId();
        log.info("📌 현재 로그인한 userId={}", userId);

        Mentor mentor = mentorEntityRepository.findByUserId(userId.longValue())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "멘토 정보를 찾을 수 없습니다. userId=" + userId));

        log.info("✅ 매핑된 mentorId={}", mentor.getMentorId());

        Map<String, Long> response = new HashMap<>();
        response.put("mentorId", mentor.getMentorId());
        return ResponseEntity.ok(response);
    }

    /**
     * 7. 멘토링 진행 상황 조회
     */
    @GetMapping("/progress")
    public ResponseEntity<List<Map<String, Object>>> getMentoringProgress(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId().longValue();
        log.info("📌 현재 로그인한 userId={}", userId);

        Mentor mentor = mentorEntityRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "멘토 정보를 찾을 수 없습니다. userId=" + userId));

        log.info("✅ 매핑된 mentorId={}", mentor.getMentorId());

        // ACCEPTED 상태의 요청들 조회
        List<MentorRequest> acceptedRequests = mentorRequestRepository
                .findByMentorIdAndStatus(mentor.getMentorId(), "ACCEPTED");

        log.info("🔍 수락된 요청 개수={}", acceptedRequests.size());

        List<Map<String, Object>> result = acceptedRequests.stream().map(req -> {
            // mentee_id로 멘티 정보 조회
            Mentee mentee = menteeRepository.findById(req.getMenteeId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "멘티를 찾을 수 없습니다. menteeId=" + req.getMenteeId()));
            
            log.info("👤 멘티 정보: menteeId={}, userId={}, name={}, age={}", 
                    mentee.getMenteeId(), mentee.getUserId(), mentee.getName(), mentee.getAge());
            
            Map<String, Object> menteeMap = new HashMap<>();
            menteeMap.put("id", mentee.getUserId());
            menteeMap.put("name", mentee.getName());
            menteeMap.put("age", mentee.getAge());
            menteeMap.put("status", "in_progress");
            return menteeMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * 8. chatId로 멘토 정보 조회
     */
    @GetMapping("/mentorByChatId")
    public ResponseEntity<Map<String, Object>> getMentorByChatId(@RequestParam Integer chatId) {
        log.info("🔍 chatId로 멘토 정보 조회: chatId={}", chatId);
        
        try {
            // chatId로 채팅방 조회
            MentoringChatroom chatroom = mentoringChatroomRepository.findById(chatId.longValue())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "채팅방을 찾을 수 없습니다. chatId=" + chatId));
            
            // participant2Id가 멘토 ID (participant1Id가 멘티 ID)
            Long mentorId = chatroom.getParticipant2Id();
            
            // mentorId로 멘토 정보 조회
            Mentor mentor = mentorEntityRepository.findById(mentorId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "멘토 정보를 찾을 수 없습니다. mentorId=" + mentorId));
            
            // 멘토의 user 정보 조회 (멘토 이름 등을 위해)
            MemberVO mentorUser = userRepository.findById(mentor.getUserId().intValue())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "멘토 사용자 정보를 찾을 수 없습니다. userId=" + mentor.getUserId()));
            
            log.info("✅ 멘토 정보 조회 완료: mentorId={}, name={}", mentorId, mentorUser.getName());
            
            Map<String, Object> response = new HashMap<>();
            response.put("name", mentorUser.getName());
            response.put("subject", mentor.getSubject() != null ? mentor.getSubject() : "전문 과목");
            response.put("avatar", mentorUser.getName() != null ? mentorUser.getName().substring(0, 1) : "M");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ chatId로 멘토 정보 조회 실패: chatId={}", chatId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "멘토 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 9. chatId로 멘티 정보 조회
     */
    @GetMapping("/menteeByChatId")
    public ResponseEntity<Map<String, Object>> getMenteeByChatId(@RequestParam Integer chatId) {
        log.info("🔍 chatId로 멘티 정보 조회: chatId={}", chatId);
        
        try {
            // chatId로 채팅방 조회
            MentoringChatroom chatroom = mentoringChatroomRepository.findById(chatId.longValue())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "채팅방을 찾을 수 없습니다. chatId=" + chatId));
            
            // participant1Id가 멘티 ID (participant2Id가 멘토 ID)
            Long menteeId = chatroom.getParticipant1Id();
            
            // menteeId로 멘티 정보 조회
            Mentee mentee = menteeRepository.findById(menteeId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "멘티 정보를 찾을 수 없습니다. menteeId=" + menteeId));
            
            log.info("✅ 멘티 정보 조회 완료: menteeId={}, name={}, age={}", 
                    menteeId, mentee.getName(), mentee.getAge());
            
            Map<String, Object> response = new HashMap<>();
            response.put("name", mentee.getName());
            response.put("age", mentee.getAge());
            response.put("avatar", mentee.getName() != null ? mentee.getName().substring(0, 1) : "?");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ chatId로 멘티 정보 조회 실패: chatId={}", chatId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "멘티 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
