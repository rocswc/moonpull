package com.example.service;

import com.example.entity.MoonpullChatSession;
import com.example.DAO.MoonpullChatSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MoonpullChatSessionService {
    
    @Autowired
    private MoonpullChatSessionRepository moonpullChatSessionRepository;
    
    /**
     * 새 채팅 세션 생성
     */
    public MoonpullChatSession createNewSession(String userId) {
        MoonpullChatSession session = new MoonpullChatSession();
        session.setSessionId(UUID.randomUUID().toString());
        session.setUserId(userId);
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        session.setActive(true);
        
        return moonpullChatSessionRepository.save(session);
    }
    
    /**
     * 세션에 메시지 추가
     */
    public MoonpullChatSession addMessage(String sessionId, String content, boolean isUser) {
        Optional<MoonpullChatSession> optionalSession = moonpullChatSessionRepository.findBySessionId(sessionId);
        
        if (optionalSession.isPresent()) {
            MoonpullChatSession session = optionalSession.get();
            session.addMessage(content, isUser);
            return moonpullChatSessionRepository.save(session);
        } else {
            throw new RuntimeException("세션을 찾을 수 없습니다: " + sessionId);
        }
    }
    
    /**
     * 사용자의 모든 채팅 세션 목록
     */
    public List<MoonpullChatSession> getUserSessions(String userId) {
        return moonpullChatSessionRepository.findByUserIdAndIsActiveTrueOrderByUpdatedAtDesc(userId);
    }
    
    /**
     * 세션 조회
     */
    public Optional<MoonpullChatSession> getSession(String sessionId) {
        return moonpullChatSessionRepository.findBySessionId(sessionId);
    }
    
    /**
     * 세션 삭제 (비활성화)
     */
    public void deleteSession(String sessionId) {
        Optional<MoonpullChatSession> optionalSession = moonpullChatSessionRepository.findBySessionId(sessionId);
        if (optionalSession.isPresent()) {
            MoonpullChatSession session = optionalSession.get();
            session.setActive(false);
            moonpullChatSessionRepository.save(session);
        }
    }
    
    /**
     * 세션 제목 업데이트
     */
    public MoonpullChatSession updateSessionTitle(String sessionId, String newTitle) {
        Optional<MoonpullChatSession> optionalSession = moonpullChatSessionRepository.findBySessionId(sessionId);
        if (optionalSession.isPresent()) {
            MoonpullChatSession session = optionalSession.get();
            session.setTitle(newTitle);
            session.setUpdatedAt(LocalDateTime.now());
            return moonpullChatSessionRepository.save(session);
        } else {
            throw new RuntimeException("세션을 찾을 수 없습니다: " + sessionId);
        }
    }
}