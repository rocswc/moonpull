package com.example.DAO;

import com.example.entity.Mentor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Mentor, Long> {
    // 🔧 user_id 기준으로 Mentor 찾기
    Optional<Mentor> findByUserId(Long userId);
}
