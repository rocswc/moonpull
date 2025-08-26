package com.example.controller;

import com.example.dto.MyMentorListDTO;
import com.example.service.MyMentorListService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/mentoring")
public class MyMentorlistController {

    private final MyMentorListService service;

    public MyMentorlistController(MyMentorListService service) {
        this.service = service;
    }

    // 진행 중 멘토링 조회
    @GetMapping("/my-progress")
    public List<MyMentorListDTO> getMentoringProgress(@RequestParam("menteeId") int menteeId) {
        log.info("👉 진행중 멘토링 조회 요청: menteeId={}", menteeId);
        
        try {
            List<MyMentorListDTO> result = service.getActiveMentorings(menteeId);
            log.info("✅ 진행중 멘토링 조회 성공: menteeId={}, count={}", menteeId, result.size());
            
            // 디버깅을 위한 상세 로그
            for (MyMentorListDTO dto : result) {
                log.info("📋 멘토링 데이터: progressId={}, mentorId={}, status={}, startedAt={}, endedAt={}", 
                    dto.getProgressId(), dto.getMentorId(), dto.getStatus(), dto.getStartedAt(), dto.getEndedAt());
            }
            
            return result;
        } catch (Exception e) {
            log.error("❌ 진행중 멘토링 조회 실패: menteeId={}, error={}", menteeId, e.getMessage(), e);
            throw e;
        }
    }

    // 멘토링 종료
    @PostMapping("/end/{progressId}")
    public ResponseEntity<String> endMentoring(@PathVariable("progressId") int progressId) {
        log.info("👉 멘토링 종료 요청: progressId={}", progressId);

        try {
            // 1. 현재 상태 확인
            log.info("🔍 멘토링 종료 전 상태 확인: progressId={}", progressId);
            
            int updated = service.endMentoring(progressId);
            log.info("👉 DB 업데이트 결과: updated={}", updated);

            if (updated > 0) {
                log.info("✅ 멘토링 종료 성공: progressId={}, updated={}", progressId, updated);
                log.info("🎯 업데이트된 내용:");
                log.info("   - mentoring_progress.connection_status = 'ended'");
                log.info("   - mentoring_progress.end_date = NOW()");
                log.info("   - mentor_request.status = 'ENDED'");
                log.info("   - mentor_request.end_date = NOW()");
                return ResponseEntity.ok("멘토링 종료 성공");
            } else {
                log.warn("⚠️ 해당 progressId={}를 찾을 수 없거나 이미 종료된 상태입니다.", progressId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 progressId 없음 또는 이미 종료됨");
            }
        } catch (Exception e) {
            log.error("❌ 멘토링 종료 중 오류 발생: progressId={}, error={}", progressId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("멘토링 종료 중 오류 발생: " + e.getMessage());
        }
    }
}

