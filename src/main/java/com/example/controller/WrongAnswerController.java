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
    public ResponseEntity<List<WrongAnswerVO>> getWrongAnswers(
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) String subject) {

        System.out.println("📌 [Controller] /api/wrong-answers 호출됨");
        System.out.println("📌 [Controller] userId = " + userId + ", subject = " + subject);

        try {
            List<WrongAnswerVO> wrongAnswers;

            if (userId != null) {
                // 특정 사용자의 오답노트 조회 (Integer를 Long으로 변환)
                System.out.println("📌 [Controller] userId가 있어서 list() 호출: userId=" + userId);
                wrongAnswers = wrongAnswerService.list(userId.longValue(), subject);
            } else {
                // userId가 없으면 모든 오답노트 조회 (디버깅용)
                System.out.println("📌 [Controller] userId가 없어서 모든 오답노트 조회");
                wrongAnswers = wrongAnswerService.listAll();
            }

            System.out.println("📌 [Controller] 서비스 결과 개수 = " + wrongAnswers.size());
            return ResponseEntity.ok(wrongAnswers);
        } catch (Exception e) {
            System.err.println("❌ [Controller] 오답노트 조회 실패: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    /** 오답 단건 저장 (정답이면 204 반환) */
    @PostMapping
    public ResponseEntity<?> createWrongAnswer(@Valid @RequestBody WrongAnswerCreateRequestDTO request) {
        System.out.println("📌 [Controller] 단건 저장 호출됨 request = " + request);
        System.out.println("📌 [Controller] userId = " + request.getUserId());
        System.out.println("📌 [Controller] questionId = " + request.getQuestionId());
        System.out.println("📌 [Controller] isCorrect = " + request.getIsCorrect());

        try {
            WrongAnswerVO saved = wrongAnswerService.saveIfWrong(request);

            if (saved == null) {
                System.out.println("📌 [Controller] 정답이므로 저장하지 않음");
                return ResponseEntity.noContent().build(); // 정답이면 저장 안 함
            }

            System.out.println("📌 [Controller] 저장 성공 id = " + saved.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            System.err.println("❌ [Controller] 오답 저장 실패: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("오답 저장 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /** 오답 배치 저장 (시험 종료 시 한 번에 올리기용) */
    @PostMapping("/batch")
    public ResponseEntity<List<WrongAnswerVO>> createWrongAnswersBatch(
            @Valid @RequestBody List<WrongAnswerCreateRequestDTO> requests) {
        List<WrongAnswerVO> saved = wrongAnswerService.saveWrongBatch(requests);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

}