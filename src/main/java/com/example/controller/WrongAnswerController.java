package com.example.controller;
import com.example.VO.WrongAnswerVO;
import com.example.dto.WrongAnswerCreateRequestDTO;
import com.example.service.WrongAnswerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wrong-answers")
@RequiredArgsConstructor
public class WrongAnswerController {

    private final WrongAnswerService wrongAnswerService;

    // 목록 조회: /api/wrong-answers?userId=1&subject=Math (subject 생략 가능)
    @GetMapping
    public ResponseEntity<List<WrongAnswerVO>> list(
            @RequestParam Long userId,
            @RequestParam(required = false) String subject
    ) {
        return ResponseEntity.ok(wrongAnswerService.list(userId, subject));
    }
    
    /** 오답 단건 저장 (정답이면 204 반환) */
    @PostMapping
    public ResponseEntity<?> createWrongAnswer(@Valid @RequestBody WrongAnswerCreateRequestDTO request) {
        WrongAnswerVO saved = wrongAnswerService.saveIfWrong(request);
        if (saved == null) {
            return ResponseEntity.noContent().build(); // 정답이어서 저장 안 함
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /** 오답 배치 저장 (시험 종료 시 한 번에 올리기용) */
    @PostMapping("/batch")
    public ResponseEntity<List<WrongAnswerVO>> createWrongAnswersBatch(
            @Valid @RequestBody List<WrongAnswerCreateRequestDTO> requests) {
        List<WrongAnswerVO> saved = wrongAnswerService.saveWrongBatch(requests);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
 
    // ✅ 오답 해결(soft delete 대체): /api/wrong-answers/{id}/resolve?correct=true
    @PostMapping("/{id}/resolve")
    public ResponseEntity<Void> resolveByPost(@PathVariable String id,
                                              @RequestParam(defaultValue = "true") boolean correct) {
        wrongAnswerService.markCorrect(id, correct);
        return ResponseEntity.noContent().build();
    }
    
    
}