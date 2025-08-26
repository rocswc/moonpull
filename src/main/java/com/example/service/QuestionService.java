package com.example.service;

import com.example.DAO.QuestionRepository;
import com.example.DAO.MenteeRepository;
import com.example.DAO.MentorEntityRepository;
import com.example.DAO.MemberRepository;
import com.example.entity.Question;
import com.example.entity.Mentee;
import com.example.entity.Mentor;
import com.example.entity.Member;
import com.example.dto.QuestionDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionService {
    
    private final QuestionRepository questionRepository;
    private final MenteeRepository menteeRepository;
    private final MentorEntityRepository mentorEntityRepository;
    private final MemberRepository memberRepository;
    
    // 멘티가 질문 등록
    @Transactional
    public QuestionDTO createQuestion(Long menteeId, Long mentorId, String subject, String title, String content) {
        log.info("📝 질문 등록: menteeId={}, mentorId={}, subject={}, title={}", menteeId, mentorId, subject, title);
        
        Question question = new Question();
        question.setMenteeId(menteeId);
        question.setMentorId(mentorId);
        question.setSubject(subject);
        question.setTitle(title);
        question.setContent(content);
        question.setStatus(Question.QuestionStatus.PENDING);
        question.setCreatedAt(LocalDateTime.now());
        
        Question savedQuestion = questionRepository.save(question);
        log.info("✅ 질문 등록 완료: questionId={}", savedQuestion.getQuestionId());
        
        return convertToDTO(savedQuestion);
    }
    
    // 멘토가 질문에 답변
    @Transactional
    public QuestionDTO answerQuestion(Long questionId, String answerContent) {
        log.info("💬 질문 답변: questionId={}", questionId);
        
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("질문을 찾을 수 없습니다. questionId=" + questionId));
        
        question.setAnswerContent(answerContent);
        question.setStatus(Question.QuestionStatus.ANSWERED);
        question.setAnsweredAt(LocalDateTime.now());
        
        Question savedQuestion = questionRepository.save(question);
        log.info("✅ 답변 완료: questionId={}", savedQuestion.getQuestionId());
        
        return convertToDTO(savedQuestion);
    }
    
    // 멘티의 질문 목록 조회
    public List<QuestionDTO> getMenteeQuestions(Long menteeId) {
        log.info("📋 멘티 질문 목록 조회: menteeId={}", menteeId);
        
        List<Question> questions = questionRepository.findByMenteeIdOrderByCreatedAtDesc(menteeId);
        return questions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // 멘토의 질문 목록 조회
    public List<QuestionDTO> getMentorQuestions(Long mentorId) {
        log.info("📋 멘토 질문 목록 조회: mentorId={}", mentorId);
        
        List<Question> questions = questionRepository.findByMentorIdOrderByCreatedAtDesc(mentorId);
        return questions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // 멘토의 답변 대기 질문 목록 조회
    public List<QuestionDTO> getPendingQuestionsForMentor(Long mentorId) {
        log.info("⏳ 멘토 답변 대기 질문 조회: mentorId={}", mentorId);
        
        List<Question> questions = questionRepository.findByMentorIdAndStatusOrderByCreatedAtDesc(
                mentorId, Question.QuestionStatus.PENDING);
        return questions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // 질문 상세 조회
    public QuestionDTO getQuestionById(Long questionId) {
        log.info("🔍 질문 상세 조회: questionId={}", questionId);
        
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("질문을 찾을 수 없습니다. questionId=" + questionId));
        
        return convertToDTO(question);
    }
    
    // DTO 변환
    private QuestionDTO convertToDTO(Question question) {
        QuestionDTO dto = new QuestionDTO();
        dto.setQuestionId(question.getQuestionId());
        dto.setMenteeId(question.getMenteeId());
        dto.setMentorId(question.getMentorId());
        dto.setSubject(question.getSubject());
        dto.setTitle(question.getTitle());
        dto.setContent(question.getContent());
        dto.setStatus(question.getStatus().name());
        
        // 날짜 형식을 ISO 문자열로 변환
        if (question.getCreatedAt() != null) {
            dto.setCreatedAt(question.getCreatedAt().toString());
        } else {
            dto.setCreatedAt(null);
        }
        if (question.getAnsweredAt() != null) {
            dto.setAnsweredAt(question.getAnsweredAt().toString());
        } else {
            dto.setAnsweredAt(null);
        }
        
        dto.setAnswerContent(question.getAnswerContent());
        
        // 멘티 이름 조회
        try {
            Mentee mentee = menteeRepository.findById(question.getMenteeId())
                    .orElse(null);
            if (mentee != null) {
                Member menteeMember = memberRepository.findById(mentee.getUserId())
                        .orElse(null);
                dto.setMenteeName(menteeMember != null ? menteeMember.getName() : "알 수 없음");
            }
        } catch (Exception e) {
            log.warn("멘티 이름 조회 실패: menteeId={}", question.getMenteeId());
            dto.setMenteeName("알 수 없음");
        }
        
        // 멘토 이름 조회
        try {
            Mentor mentor = mentorEntityRepository.findById(question.getMentorId())
                    .orElse(null);
            if (mentor != null) {
                Member mentorMember = memberRepository.findById(mentor.getUserId())
                        .orElse(null);
                dto.setMentorName(mentorMember != null ? mentorMember.getName() : "알 수 없음");
            }
        } catch (Exception e) {
            log.warn("멘토 이름 조회 실패: mentorId={}", question.getMentorId());
            dto.setMentorName("알 수 없음");
        }
        
        return dto;
    }
}

