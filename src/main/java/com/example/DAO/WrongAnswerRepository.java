package com.example.DAO;
import com.example.VO.WrongAnswerVO;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WrongAnswerRepository extends MongoRepository<WrongAnswerVO, String> {
    Optional<WrongAnswerVO> findByUserIdAndQuestionId(Long userId, String questionId);  
    List<WrongAnswerVO> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<WrongAnswerVO> findByUserIdAndSubjectOrderByCreatedAtDesc(Long userId, String subject);
}