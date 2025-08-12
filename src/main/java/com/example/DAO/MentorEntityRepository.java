package com.example.DAO;

import com.example.entity.Mentor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MentorEntityRepository extends JpaRepository<Mentor, Long> {
    Optional<Mentor> findByUserId(Long userId);
}
