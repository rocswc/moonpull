// src/main/java/com/example/service/FcmTokenService.java
package com.example.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.DAO.FcmTokenRepository;
import com.example.VO.FcmTokenVO;

@Service
@RequiredArgsConstructor
public class FcmTokenService {
    private final FcmTokenRepository repo;

    public void register(Integer userId, String token) {
        FcmTokenVO vo = new FcmTokenVO();
        vo.setUserId(userId);
        vo.setToken(token);
        repo.insertToken(vo); // ON DUPLICATE KEY UPDATE last_used_at = NOW() (XML)
    }

    public void unregister(String token) {
        repo.deleteToken(token);
    }

    public List<FcmTokenVO> tokensOf(Integer userId) {
        return repo.getTokensByUserId(userId);
    }
}
