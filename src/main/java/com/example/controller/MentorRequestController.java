package com.example.controller;

import com.example.DAO.MenteeRepository;
import com.example.DAO.MentorEntityRepository;
import com.example.DAO.MentorRequestRepository;
import com.example.dto.MentorRequestDTO;
import com.example.entity.Mentee;
import com.example.entity.Mentor;
import com.example.entity.MentorRequest;
import com.example.security.CustomUserDetails;
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

    /**
     * 1. 멘티 → 멘토 요청 생성
     */
    @PostMapping("/request")
    public ResponseEntity<?> createRequest(@RequestBody MentorRequestDTO dto) {
        log.info("======== [createRequest] 멘토 요청 생성 시작 ========");
        log.info("📥 받은 DTO: menteeUserId={}, mentorUserId={}", dto.getMenteeId(), dto.getMentorId());

        // 1) menteeUserId → mentee_id 변환
        Mentee mentee = menteeRepository.findByUserId(dto.getMenteeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "멘티를 찾을 수 없습니다. userId=" + dto.getMenteeId()));

        // 2) mentorUserId → mentor_id 변환
        Mentor mentor = mentorEntityRepository.findByUserId(dto.getMentorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "멘토를 찾을 수 없습니다. userId=" + dto.getMentorId()));

        // 3) 요청 저장
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

        Mentor mentor = mentorEntityRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "멘토 정보를 찾을 수 없습니다. userId=" + userId));

        List<MentorRequest> requests = mentorRequestRepository
                .findByMentorIdAndStatus(mentor.getMentorId(), "REQUESTED");

        List<MentorRequestInfo> result = requests.stream().map(req -> {
            Mentee mentee = menteeRepository.findById(req.getMenteeId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "멘티를 찾을 수 없습니다. menteeId=" + req.getMenteeId()));
            return new MentorRequestInfo(req.getId(), mentee.getMenteeId(),
                    mentee.getName(), mentee.getAge());
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * 3. 멘토 → 요청 수락
     */
    @PostMapping("/accept-request")
    public ResponseEntity<String> acceptRequest(@AuthenticationPrincipal CustomUserDetails userDetails,
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

        request.setStatus("ACCEPTED");
        mentorRequestRepository.save(request);

        return ResponseEntity.ok("멘토 요청이 수락되었습니다.");
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
