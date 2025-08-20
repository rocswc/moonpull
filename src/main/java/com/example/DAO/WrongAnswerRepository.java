package com.example.DAO;

import com.example.VO.WrongAnswerVO;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
public interface WrongAnswerRepository extends MongoRepository<WrongAnswerVO, String> {
    // 필요 시 쿼리 메서드 추가 (예: findBySubjectAndSchoolAndGradeAndIsCorrectFalse 등)
}
