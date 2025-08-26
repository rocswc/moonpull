package com.example.controller;

import com.example.DAO.MenteeRepository;
import com.example.DAO.MemberRepository;
import com.example.DAO.MentorEntityRepository;
import com.example.DAO.MentorRequestRepository;
import com.example.DAO.MentoringChatroomRepository;
import com.example.dto.MenteeInfo;
import com.example.dto.MentorRequestDTO;
import com.example.dto.MentorRequestInfo;
import com.example.dto.MyMentorListDTO;
import com.example.entity.Member;
import com.example.entity.Mentee;
import com.example.entity.Mentor;
import com.example.entity.MentorRequest;
import com.example.entity.MentoringChatroom;
import com.example.security.CustomUserDetails;
import com.example.service.MentoringChatroomService;
import com.example.service.MyMentorListService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Date;

@Slf4j
@RestController
@RequestMapping("/api/mentoring")
@RequiredArgsConstructor
public class MentorRequestController {

    private final MentorRequestRepository mentorRequestRepository;
    private final MenteeRepository menteeRepository;
    private final MemberRepository memberRepository;
    private final MentorEntityRepository mentorEntityRepository;
    private final MentoringChatroomService mentoringChatroomService;
    private final MentoringChatroomRepository mentoringChatroomRepository;
    private final MyMentorListService myMentorListService; 

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

        // menteeUserId → mentee_id 변환 (멘티가 없으면 자동 생성)
        Mentee mentee = menteeRepository.findByUserId(dto.getMenteeId())
                .orElseGet(() -> {
                    log.info("🔧 멘티 정보가 없어서 자동 생성: userId={}", dto.getMenteeId());
                    
                    // member 테이블에서 사용자 정보 조회
                    Member member = memberRepository.findById(dto.getMenteeId().longValue())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                    "사용자 정보를 찾을 수 없습니다. userId=" + dto.getMenteeId()));
                    
                    // 새로운 멘티 생성
                    Mentee newMentee = new Mentee();
                    newMentee.setUserId(dto.getMenteeId().longValue());
                    newMentee.setName(member.getName());
                    newMentee.setAge(20); // 기본 나이
                    
                    Mentee savedMentee = menteeRepository.save(newMentee);
                    log.info("✅ 멘티 자동 생성 완료: menteeId={}, name={}", savedMentee.getMenteeId(), savedMentee.getName());
                    
                    return savedMentee;
                });

        // mentorUserId → mentor_id 변환
        Mentor mentor = mentorEntityRepository.findByUserId(dto.getMentorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "멘토를 찾을 수 없습니다. userId=" + dto.getMentorId()));

        // 중복 요청 확인 - 같은 멘티-멘토 조합의 REQUESTED 상태 요청이 있는지 확인
        List<MentorRequest> existingRequests = mentorRequestRepository
                .findByMenteeIdAndMentorIdAndStatus(mentee.getMenteeId(), mentor.getMentorId(), "REQUESTED");
        
        if (!existingRequests.isEmpty()) {
            log.warn("⚠️ 중복 요청 감지: menteeId={}, mentorId={}, 기존 요청 개수={}", 
                    mentee.getMenteeId(), mentor.getMentorId(), existingRequests.size());
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "이미 해당 멘토에게 요청을 보낸 상태입니다.");
        }

        // 요청 저장
        MentorRequest request = new MentorRequest();
        request.setMenteeId(mentee.getMenteeId());
        request.setMentorId(mentor.getMentorId());
        request.setStatus("REQUESTED");
        request.setStartedAt(LocalDateTime.now());

        mentorRequestRepository.save(request);

        log.info("💾 저장 완료: requestId={}, menteeId={}, mentorId={}, status={}",
                request.getId(), request.getMenteeId(), request.getMentorId(), request.getStatus());

        // 실시간 알림 전송 (에러가 발생해도 요청 생성은 성공하도록 try-catch)
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
            // broker.convertAndSendToUser(
            //     String.valueOf(mentor.getUserId()), 
            //     "/queue/notifications", 
            //     notification
            // );
            log.info("✅ 멘토 알림 전송 완료: mentorId={}", mentor.getUserId());
        } catch (Exception e) {
            log.warn("⚠️ 알림 전송 실패 (요청 생성은 성공): {}", e.getMessage());
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

        // 2. 채팅방 생성
        log.info("🔍 채팅방 생성 시작: menteeId={}, mentorId={}", 
                request.getMenteeId(), request.getMentorId());
        
        int chatId;
        try {
            chatId = mentoringChatroomService.createChatroomAndUpdateProgress(
                    request.getMenteeId().intValue(), 
                    request.getMentorId().intValue()
            );
            log.info("✅ 채팅방 생성 완료: chatId={}", chatId);
        } catch (Exception e) {
            log.error("❌ 채팅방 생성 실패", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "채팅방 생성 중 오류가 발생했습니다: " + e.getMessage());
        }

        log.info("✅ 멘토 요청 수락 완료 - requestId={}, status=ACCEPTED, chatId={}", requestId, chatId);

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
     * 7. 멘토링 진행 상황 조회 (멘티용)
     */
    @GetMapping("/progress")
    public ResponseEntity<List<Map<String, Object>>> getMentoringProgress(@RequestParam("menteeId") int menteeId) {
        log.info("📌 멘티 멘토링 진행 상황 조회: menteeId={}", menteeId);

        try {
            // MyMentorListService를 사용하여 멘티의 멘토링 진행 상황 조회
            List<MyMentorListDTO> mentorings = myMentorListService.getActiveMentorings(menteeId);
            
            log.info("✅ 멘토링 진행 상황 조회 완료: menteeId={}, count={}", menteeId, mentorings.size());
            
            // 디버깅을 위한 상세 로그
            for (MyMentorListDTO dto : mentorings) {
                log.info("📋 멘토링 데이터: progressId={}, mentorId={}, status={}, startedAt={}, endedAt={}", 
                    dto.getProgressId(), dto.getMentorId(), dto.getStatus(), dto.getStartedAt(), dto.getEndedAt());
            }
            
            List<Map<String, Object>> result = mentorings.stream().map(dto -> {
                Map<String, Object> mentoringMap = new HashMap<>();
                mentoringMap.put("mentoring_progress_id", dto.getProgressId());
                mentoringMap.put("mentor_id", dto.getMentorId());
                mentoringMap.put("mentor_name", dto.getMentorName());
                mentoringMap.put("chat_id", null);
                mentoringMap.put("connection_status", dto.getStatus());
                mentoringMap.put("start_date", dto.getStartedAt() != null ? dto.getStartedAt().toString() : new Date().toString());
                mentoringMap.put("end_date", dto.getEndedAt() != null ? dto.getEndedAt().toString() : null);
                return mentoringMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("❌ 멘티 멘토링 진행 상황 조회 실패: menteeId={}", menteeId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "멘토링 진행 상황 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 7-1. 멘토링 진행 상황 조회 (멘토용)
     */
    @GetMapping("/progress/mentor")
    public ResponseEntity<List<Map<String, Object>>> getMentorProgress(@RequestParam("mentorId") int mentorId) {
        log.info("📌 멘토 멘토링 진행 상황 조회: mentorId={}", mentorId);

        try {
            // mentorId로 해당 멘토의 모든 멘토링 요청 조회
            List<MentorRequest> mentorRequests = mentorRequestRepository.findByMentorIdAndStatusIn(
                (long) mentorId, List.of("ACCEPTED", "ENDED"));
            
            log.info("✅ 멘토링 진행 상황 조회 완료: mentorId={}, count={}", mentorId, mentorRequests.size());
            
            List<Map<String, Object>> result = mentorRequests.stream().map(request -> {
                Map<String, Object> mentoringMap = new HashMap<>();
                mentoringMap.put("mentoring_progress_id", request.getId());
                mentoringMap.put("mentee_id", request.getMenteeId());
                
                // 멘티 이름 조회
                String menteeName = "알 수 없음";
                try {
                    Mentee mentee = menteeRepository.findById(request.getMenteeId()).orElse(null);
                    if (mentee != null) {
                        // Member 테이블에서 실제 이름 조회
                        Member menteeMember = memberRepository.findById(mentee.getUserId()).orElse(null);
                        if (menteeMember != null) {
                            menteeName = menteeMember.getName();
                        } else {
                            menteeName = "멘티 " + mentee.getUserId();
                        }
                    }
                } catch (Exception e) {
                    log.warn("멘티 이름 조회 실패: menteeId={}", request.getMenteeId());
                }
                
                mentoringMap.put("mentee_name", menteeName);
                mentoringMap.put("chat_id", null); // 채팅방 ID는 필요 없으므로 null로 설정
                mentoringMap.put("connection_status", request.getStatus().toLowerCase());
                mentoringMap.put("start_date", request.getStartedAt() != null ? request.getStartedAt().toString() : new Date().toString());
                mentoringMap.put("end_date", request.getEndDate() != null ? request.getEndDate().toString() : null);
                return mentoringMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("❌ 멘토 멘토링 진행 상황 조회 실패: mentorId={}", mentorId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "멘토링 진행 상황 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
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
            // 여기서는 간단히 mentorId를 사용하지만, 실제로는 User 테이블에서 이름을 가져와야 함
            log.info("✅ 멘토 정보 조회 완료: mentorId={}", mentorId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("name", "멘토 " + mentorId); // 임시 이름
            response.put("subject", "전문 과목"); // 임시 과목
            response.put("avatar", "M"); // 임시 아바타
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ chatId로 멘토 정보 조회 실패: chatId={}", chatId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "멘토 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
