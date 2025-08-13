package com.example.DAO;

import com.example.entity.Mentee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MenteeRepository extends JpaRepository<Mentee, Long> {
    Optional<Mentee> findByUserId(Long userId);

    // 중복 레코드가 존재할 수 있으므로 가장 최근(mentee_id 내림차순) 1건만 안전하게 조회
    Optional<Mentee> findTopByUserIdOrderByMenteeIdDesc(Long userId);
}
