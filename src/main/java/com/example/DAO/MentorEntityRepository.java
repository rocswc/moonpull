package com.example.DAO;

import com.example.entity.Mentor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MentorEntityRepository extends JpaRepository<Mentor, Long> {
    Optional<Mentor> findByUserId(Long userId);
}
