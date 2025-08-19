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
        return service.getActiveMentorings(menteeId);
    }

    // 멘토링 종료
    @PostMapping("/end/{progressId}")
    public ResponseEntity<String> endMentoring(@RequestParam("progressId") int progressId) {
        log.info("👉 멘토링 종료 요청: progressId={}", progressId);

        int updated = service.endMentoring(progressId);
        log.info("👉 DB 업데이트 결과: updated={}", updated);

        if (updated > 0) {
            return ResponseEntity.ok("멘토링 종료 성공");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 progressId 없음");
        }
    }
}
