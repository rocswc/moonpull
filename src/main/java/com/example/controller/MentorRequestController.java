package com.example.controller;

import com.example.DAO.MenteeRepository;
import com.example.DAO.MentorEntityRepository;
import com.example.DAO.MentorRequestRepository;
import com.example.DAO.MemberRepository;
import com.example.dto.MentorRequestDTO;
import com.example.entity.Mentee;
import com.example.entity.Mentor;
import com.example.entity.MentorRequest;
import com.example.entity.Member;
import com.example.security.CustomUserDetails;
import com.example.service.MentoringChatroomService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
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
    private final MemberRepository memberRepository;
    private final MentoringChatroomService mentoringChatroomService;

    /**
     * 1. 멘티 → 멘토 요청 생성
     */
    @PostMapping("/request")
    public ResponseEntity<?> createRequest(@RequestBody MentorRequestDTO dto) {
        log.info("======== [createRequest] 멘토 요청 생성 시작 ========");
        log.info("📥 받은 DTO: menteeUserId={}, mentorUserId={}", dto.getMenteeId(), dto.getMentorId());

        // menteeUserId → mentee_id 변환 (중복 가능성 고려: 가장 최근 1건 사용)
        Mentee mentee = menteeRepository.findTopByUserIdOrderByMenteeIdDesc(dto.getMenteeId())
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

        return ResponseEntity.ok().body(
                Map.of(
                        "message", "멘토 요청이 생성되었습니다.",
                        "requestId", request.getId()
                )
        );
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
            
            log.info("👤 멘티 정보: menteeId={}, userId={}", mentee.getMenteeId(), mentee.getUserId());
            
            // user_id로 멤버 정보 조회 (이름, 나이 등)
            Member member = memberRepository.findById(mentee.getUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "멤버 정보를 찾을 수 없습니다. userId=" + mentee.getUserId()));
            
            log.info("👤 멤버 정보: userId={}, name={}, age={}", 
                    member.getUserId(), member.getName(), mentee.getAge());
            
            return new MentorRequestInfo(req.getId(), mentee.getMenteeId(),
                    member.getName(), mentee.getAge());
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
        int chatId = mentoringChatroomService.createChatroomAndUpdateProgress(
                request.getMenteeId().intValue(), 
                request.getMentorId().intValue()
        );

        log.info("✅ 멘토 요청 수락 완료 - requestId={}, status=ACCEPTED, chatId={}", requestId, chatId);

        return ResponseEntity.ok(Map.of(
                "message", "멘토 요청이 수락되었습니다.",
                "chatId", chatId
        ));
    }

    /**
     * 4. 멘토 → 현재 로그인한 멘토의 ID 조회
     */
    @GetMapping("/mentor-id")
    public ResponseEntity<Map<String, Long>> getMentorId(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long userId = userDetails.getUserId().longValue();
        log.info("📌 현재 로그인한 userId={}", userId);

        Mentor mentor = mentorEntityRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "멘토 정보를 찾을 수 없습니다. userId=" + userId));

        log.info("✅ 매핑된 mentorId={}", mentor.getMentorId());

        return ResponseEntity.ok(Map.of("mentorId", mentor.getMentorId()));
    }

    @Getter
    @Setter
    @AllArgsConstructor
    static class MentorRequestInfo {
        private Long requestId; // 요청 ID
        private Long menteeId;  // 멘티 ID
        private String name;    // 멘티 이름
        private Integer age;    // 멘티 나이
    }
}
