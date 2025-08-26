package com.example.DAO;

import com.example.VO.WrongAnswerVO;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WrongAnswerRepository extends MongoRepository<WrongAnswerVO, String> {
    
    // 특정 사용자의 오답노트 조회 (생성일 내림차순) - 모든 데이터 조회 (디버깅용)
    @Query(value = "{'userId': ?0}", sort = "{'createdAt': -1}")
    List<WrongAnswerVO> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // 모든 오답노트 조회 (디버깅용)
    @Query(value = "{}", sort = "{'createdAt': -1}")
    List<WrongAnswerVO> findAllOrderByCreatedAtDesc();
    
    // 특정 사용자의 특정 과목 오답노트 조회 (생성일 내림차순) - 임시로 isCorrect 필터링 제거
    @Query(value = "{'userId': ?0, 'subject': ?1}", sort = "{'createdAt': -1}")
    List<WrongAnswerVO> findByUserIdAndSubjectOrderByCreatedAtDesc(Long userId, String subject);
    
    // 특정 사용자의 특정 문제 오답노트 조회
    Optional<WrongAnswerVO> findByUserIdAndQuestionId(Long userId, String questionId);
}