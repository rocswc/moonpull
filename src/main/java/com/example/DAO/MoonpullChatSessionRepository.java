package com.example.DAO;

import com.example.entity.MoonpullChatSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MoonpullChatSessionRepository extends MongoRepository<MoonpullChatSession, String> {
    
    // 세션 ID로 찾기
    Optional<MoonpullChatSession> findBySessionId(String sessionId);
    
    // 사용자별 모든 세션 (최신순)
    List<MoonpullChatSession> findByUserIdOrderByUpdatedAtDesc(String userId);
    
    // 활성 세션만 가져오기
    List<MoonpullChatSession> findByUserIdAndIsActiveTrueOrderByUpdatedAtDesc(String userId);
    
    // 최근 N개 세션
    @Query("{'userId': ?0, 'isActive': true}")
    List<MoonpullChatSession> findRecentSessions(String userId, int limit);
    
    // 오래된 세션 정리용 (30일 이상)
    @Query("{'updatedAt': {'$lt': ?0}}")
    List<MoonpullChatSession> findOldSessions(LocalDateTime cutoffDate);
}