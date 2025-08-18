package com.example.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.session.ServerSession;

import jakarta.servlet.http.HttpSession;

@Service // 스캔되어 빈으로 등록됨
public class SessionServiceImpl implements SessionService {

    private static final String KEY = "AUTH_SESSION";

    @Override
    public ServerSession create(HttpSession httpSession,
                                Integer userId,
                                Set<String> roles,
                                int sessionVersion,
                                Duration refreshTtl,
                                int maxInactiveSeconds) {
        ServerSession sess = new ServerSession(
            userId,
            roles,
            sessionVersion,
            UUID.randomUUID().toString(),          // refreshId 회전 시작
            Instant.now().plus(refreshTtl)
        );
        httpSession.setAttribute(KEY, sess);
        if (maxInactiveSeconds > 0) {
            httpSession.setMaxInactiveInterval(maxInactiveSeconds); // ex) 1800(30m)
        }
        return sess;
    }

    @Override
    public Optional<ServerSession> get(HttpSession httpSession) {
        if (httpSession == null) return Optional.empty();
        Object v = httpSession.getAttribute(KEY);
        return (v instanceof ServerSession s) ? Optional.of(s) : Optional.empty();
    }

    @Override
    public Optional<ServerSession> rotateRefresh(HttpSession httpSession, Duration refreshTtl) {
        var cur = get(httpSession).orElse(null);
        if (cur == null) return Optional.empty();
        ServerSession rotated = new ServerSession(
            cur.userId(),
            cur.roles(),
            cur.sessionVersion(),
            UUID.randomUUID().toString(),
            Instant.now().plus(refreshTtl)
        );
        httpSession.setAttribute(KEY, rotated);
        return Optional.of(rotated);
    }

    @Override
    public void invalidate(HttpSession httpSession) {
        if (httpSession != null) httpSession.invalidate();
    }
}
