package com.example.DAO;

import com.example.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    
    // 멘티의 질문 목록 조회
    List<Question> findByMenteeIdOrderByCreatedAtDesc(Long menteeId);
    
    // 멘토의 질문 목록 조회
    List<Question> findByMentorIdOrderByCreatedAtDesc(Long mentorId);
    
    // 멘토의 답변 대기 질문 목록 조회
    List<Question> findByMentorIdAndStatusOrderByCreatedAtDesc(Long mentorId, Question.QuestionStatus status);
    
    // 멘티의 특정 상태 질문 목록 조회
    List<Question> findByMenteeIdAndStatusOrderByCreatedAtDesc(Long menteeId, Question.QuestionStatus status);
}
