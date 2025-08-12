package com.example.DAO;

import com.example.entity.Mentee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MenteeRepository extends JpaRepository<Mentee, Long> {
    Optional<Mentee> findByUserId(Long userId);
}
