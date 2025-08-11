package com.example.controller;

import com.example.DAO.MentorEntityRepository;
import com.example.DAO.MentorRequestRepository;
import com.example.DAO.MenteeRepository;
import com.example.entity.Mentee;
import com.example.entity.Mentor;
import com.example.entity.MentorRequest;
import com.example.security.CustomUserDetails;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/mentoring")
@RequiredArgsConstructor
public class MentorRequestController {

    private final MentorRequestRepository mentorRequestRepository;
    private final MenteeRepository menteeRepository;
    private final MentorEntityRepository mentorEntityRepository;

    /** 1. 멘티 → 멘토 요청 생성 */
    @PostMapping("/request")
    public ResponseEntity<String> createRequest(@RequestParam Long menteeId,
                                                @RequestParam Long mentorId) {
        log.info("📌 [createRequest] menteeId={}, mentorId={}", menteeId, mentorId);

        MentorRequest request = new MentorRequest();
        request.setMenteeId(menteeId);
        request.setMentorId(mentorId);
        request.setStatus("REQUESTED");
        request.setStartedAt(LocalDateTime.now());

        mentorRequestRepository.save(request);
        log.info("✅ [createRequest] saved: id={}, menteeId={}, mentorId={}, status={}",
                request.getId(), request.getMenteeId(), request.getMentorId(), request.getStatus());

        return ResponseEntity.ok("멘토 요청이 생성되었습니다.");
    }

    /** 2. 멘토 → 요청 목록 조회 */
    @GetMapping("/requests")
    public ResponseEntity<List<MentorRequestDTO>> getRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUserId().longValue();
        log.info("📌 [getRequests] login userId={}", userId);

        Mentor mentor = mentorEntityRepository.findByUserId(userId)
                .orElseThrow(() -> {
                    log.error("❌ [getRequests] mentor not found by userId={}", userId);
                    return new RuntimeException("멘토 정보를 찾을 수 없습니다.");
                });

        Long mentorId = mentor.getMentorId();
        log.info("✅ [getRequests] mentorId={}", mentorId);

        List<MentorRequest> requests =
                mentorRequestRepository.findByMentorIdAndStatus(mentorId, "REQUESTED");

        log.info("📋 [getRequests] DB rows={}, ids={}",
                requests.size(),
                requests.stream().map(MentorRequest::getId).toList());

        List<MentorRequestDTO> result = requests.stream().map(req -> {
            log.debug("🔍 [getRequests] mapping requestId={} → menteeId={}", req.getId(), req.getMenteeId());
            Mentee mentee = menteeRepository.findById(req.getMenteeId())
                    .orElseThrow(() -> {
                        log.error("❌ [getRequests] mentee not found: menteeId={}", req.getMenteeId());
                        return new RuntimeException("멘티를 찾을 수 없습니다. menteeId=" + req.getMenteeId());
                    });
            return new MentorRequestDTO(
                    req.getId(),
                    mentee.getId(),
                    mentee.getName(),
                    mentee.getAge()
            );
        }).collect(Collectors.toList());

        log.info("✅ [getRequests] response dto size={}, menteeIds={}",
                result.size(),
                result.stream().map(MentorRequestDTO::getId).toList());

        return ResponseEntity.ok(result);
    }

    /** 3. 멘토 → 요청 수락 */
    @PostMapping("/accept-request")
    public ResponseEntity<String> acceptRequest(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                @RequestParam Long requestId) {
        Long userId = userDetails.getUserId().longValue();
        log.info("📌 [acceptRequest] login userId={}, requestId={}", userId, requestId);

        Mentor mentor = mentorEntityRepository.findByUserId(userId)
                .orElseThrow(() -> {
                    log.error("❌ [acceptRequest] mentor not found by userId={}", userId);
                    return new RuntimeException("멘토 정보를 찾을 수 없습니다.");
                });
        Long mentorId = mentor.getMentorId();
        log.info("✅ [acceptRequest] mentorId={}", mentorId);

        MentorRequest request = mentorRequestRepository.findById(requestId)
                .orElseThrow(() -> {
                    log.error("❌ [acceptRequest] request not found: requestId={}", requestId);
                    return new RuntimeException("요청을 찾을 수 없습니다.");
                });

        log.info("📋 [acceptRequest] request: id={}, mentorId={}, menteeId={}, status={}",
                request.getId(), request.getMentorId(), request.getMenteeId(), request.getStatus());

        if (!request.getMentorId().equals(mentorId)) {
            log.warn("⚠️ [acceptRequest] mentorId mismatch: login={}, req={}", mentorId, request.getMentorId());
            return ResponseEntity.status(403).body("이 요청을 수락할 권한이 없습니다.");
        }

        request.setStatus("ACCEPTED");
        mentorRequestRepository.save(request);
        log.info("✅ [acceptRequest] accepted: requestId={}", requestId);

        return ResponseEntity.ok("멘토 요청이 수락되었습니다.");
    }

    /** 4. 멘토 ID 조회 */
    @GetMapping("/mentor-id")
    public ResponseEntity<Long> getMentorId(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId().longValue();
        log.info("📌 [getMentorId] login userId={}", userId);

        Mentor mentor = mentorEntityRepository.findByUserId(userId)
                .orElseThrow(() -> {
                    log.error("❌ [getMentorId] mentor not found by userId={}", userId);
                    return new RuntimeException("멘토 정보를 찾을 수 없습니다.");
                });

        log.info("✅ [getMentorId] mentorId={}", mentor.getMentorId());
        return ResponseEntity.ok(mentor.getMentorId());
    }

    /** 5. 멘토링 중인 멘티 목록 조회 (404 해결용) */
    @GetMapping("/mentees")
    public ResponseEntity<List<Mentee>> getMentees(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId().longValue();
        log.info("📌 [getMentees] login userId={}", userId);

        Mentor mentor = mentorEntityRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("멘토 정보를 찾을 수 없습니다."));
        Long mentorId = mentor.getMentorId();

        log.info("✅ [getMentees] mentorId={}", mentorId);
        // 예시: 상태가 ACCEPTED인 요청의 멘티만 조회
        List<Long> menteeIds = mentorRequestRepository.findByMentorIdAndStatus(mentorId, "ACCEPTED")
                .stream()
                .map(MentorRequest::getMenteeId)
                .toList();

        log.info("📋 [getMentees] menteeIds={}", menteeIds);

        List<Mentee> mentees = menteeRepository.findAllById(menteeIds);
        log.info("✅ [getMentees] count={}", mentees.size());
        return ResponseEntity.ok(mentees);
    }

    @Getter @Setter @AllArgsConstructor
    static class MentorRequestDTO {
        private Long requestId; // mentor_request.id
        private Long id;        // mentee.id
        private String name;    // mentee.name
        private Integer age;    // mentee.age
    }
}
