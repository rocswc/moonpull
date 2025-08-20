package com.example.controller;

import com.example.DAO.MenteeRepository;
import com.example.DAO.MentorEntityRepository;
import com.example.entity.Mentee;
import com.example.entity.Mentor;
import com.example.dto.QuestionDTO;
import com.example.service.QuestionService;
import com.example.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {
    
    private final QuestionService questionService;
    private final MenteeRepository menteeRepository;
    private final MentorEntityRepository mentorEntityRepository;
    
    // 멘티가 질문 등록
    @PostMapping("/create")
    public ResponseEntity<?> createQuestion(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> request) {
        
        try {
            Long userId = userDetails.getUserId().longValue();
            log.info("📝 질문 등록 요청: userId={}", userId);
            
            // 멘티 정보 조회
            Mentee mentee = menteeRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("멘티 정보를 찾을 수 없습니다."));
            
            Long mentorId = Long.valueOf(request.get("mentorId").toString());
            String subject = request.get("subject").toString();
            String title = request.get("title").toString();
            String content = request.get("content").toString();
            
            QuestionDTO question = questionService.createQuestion(
                    mentee.getMenteeId(), mentorId, subject, title, content);
            
            log.info("✅ 질문 등록 완료: questionId={}", question.getQuestionId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "질문이 등록되었습니다.");
            response.put("question", question);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ 질문 등록 실패", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // 멘토가 질문에 답변
    @PostMapping("/{questionId}/answer")
    public ResponseEntity<?> answerQuestion(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long questionId,
            @RequestBody Map<String, String> request) {
        
        try {
            Long userId = userDetails.getUserId().longValue();
            log.info("💬 질문 답변 요청: userId={}, questionId={}", userId, questionId);
            
            // 멘토 정보 조회
            Mentor mentor = mentorEntityRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("멘토 정보를 찾을 수 없습니다."));
            
            String answerContent = request.get("answerContent");
            
            QuestionDTO question = questionService.answerQuestion(questionId, answerContent);
            
            log.info("✅ 답변 완료: questionId={}", question.getQuestionId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "답변이 등록되었습니다.");
            response.put("question", question);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ 답변 등록 실패", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // 멘티의 질문 목록 조회
    @GetMapping("/mentee")
    public ResponseEntity<List<QuestionDTO>> getMenteeQuestions(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        try {
            Long userId = userDetails.getUserId().longValue();
            log.info("📋 멘티 질문 목록 조회: userId={}", userId);
            
            Mentee mentee = menteeRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("멘티 정보를 찾을 수 없습니다."));
            
            List<QuestionDTO> questions = questionService.getMenteeQuestions(mentee.getMenteeId());
            
            return ResponseEntity.ok(questions);
            
        } catch (Exception e) {
            log.error("❌ 멘티 질문 목록 조회 실패", e);
            return ResponseEntity.badRequest().body(List.of());
        }
    }
    
    // 멘토의 질문 목록 조회
    @GetMapping("/mentor")
    public ResponseEntity<List<QuestionDTO>> getMentorQuestions(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        try {
            Long userId = userDetails.getUserId().longValue();
            log.info("📋 멘토 질문 목록 조회: userId={}", userId);
            
            Mentor mentor = mentorEntityRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("멘토 정보를 찾을 수 없습니다."));
            
            // 추가 로그
            log.info("🔍 조회된 멘토 정보: mentorId={}", mentor.getMentorId());
            
            List<QuestionDTO> questions = questionService.getMentorQuestions(mentor.getMentorId());
            
            // 추가 로그
            log.info("📝 조회된 질문 수: {}", questions.size());
            
            return ResponseEntity.ok(questions);
            
        } catch (Exception e) {
            log.error("❌ 멘토 질문 목록 조회 실패", e);
            return ResponseEntity.badRequest().body(List.of());
        }
    }
    
    // 멘토의 답변 대기 질문 목록 조회
    @GetMapping("/mentor/pending")
    public ResponseEntity<List<QuestionDTO>> getPendingQuestionsForMentor(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        try {
            Long userId = userDetails.getUserId().longValue();
            log.info("⏳ 멘토 답변 대기 질문 조회: userId={}", userId);
            
            Mentor mentor = mentorEntityRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("멘토 정보를 찾을 수 없습니다."));
            
            List<QuestionDTO> questions = questionService.getPendingQuestionsForMentor(mentor.getMentorId());
            
            return ResponseEntity.ok(questions);
            
        } catch (Exception e) {
            log.error("❌ 멘토 답변 대기 질문 조회 실패", e);
            return ResponseEntity.badRequest().body(List.of());
        }
    }
    
    // 질문 상세 조회
    @GetMapping("/{questionId}")
    public ResponseEntity<QuestionDTO> getQuestionById(@PathVariable Long questionId) {
        try {
            log.info("🔍 질문 상세 조회: questionId={}", questionId);
            
            QuestionDTO question = questionService.getQuestionById(questionId);
            
            return ResponseEntity.ok(question);
            
        } catch (Exception e) {
            log.error("❌ 질문 상세 조회 실패", e);
            return ResponseEntity.badRequest().body(null);
        }
    }
}
