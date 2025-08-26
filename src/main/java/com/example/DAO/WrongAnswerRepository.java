package com.example.DAO;

import com.example.VO.WrongAnswerVO;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WrongAnswerRepository extends MongoRepository<WrongAnswerVO, String> {

}