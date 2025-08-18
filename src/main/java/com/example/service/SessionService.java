package com.example.service;

import java.time.Duration;
import java.util.Optional;
import java.util.Set;

import com.example.session.ServerSession;

import jakarta.servlet.http.HttpSession;

public interface SessionService {

    // 로그인 성공 시 세션 생성/저장 
    ServerSession create(HttpSession httpSession,
                         Integer userId,
                         Set<String> roles,
                         int sessionVersion,
                         Duration refreshTtl,
                         int maxInactiveSeconds);

    //** 현재 세션 스냅샷 조회 
    Optional<ServerSession> get(HttpSession httpSession);

    //** 리프레시 회전(재발급 성공 시 호출) 
    Optional<ServerSession> rotateRefresh(HttpSession httpSession, Duration refreshTtl);

    // 강제 로그아웃 
    void invalidate(HttpSession httpSession);
}
