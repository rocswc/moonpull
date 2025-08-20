package com.example.service;

import com.example.VO.MemberVO;
import com.example.DAO.UserRepository;
import com.example.dto.KakaoUserDTO;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ===== 존재 여부 =====
    @Override
    public boolean existsBySocialIdAndType(String socialId, String socialType) {
        return userRepository.existsBySocialIdAndSocialType(socialId, socialType);
    }

    // ===== 조회 =====
    @Override
    public Optional<MemberVO> getBySocialIdAndType(String socialId, String socialType) {
        return userRepository.findBySocialIdAndSocialType(socialId, socialType);
    }

    @Override
    public Optional<MemberVO> getByEmail(String email) {
        if (email == null) return Optional.empty();
        String normalized = email.trim();
        // DB 콜레이션에 상관없이 안전
        return userRepository.findByEmailIgnoreCase(normalized)
                .or(() -> userRepository.findByEmail(normalized));
    }

    @Override
    public Optional<MemberVO> getById(Integer id) {
        return userRepository.findById(id);
    }

    // ===== 소셜 처리 (필요 시 구현) =====
    @Override
    public void processKakaoLogin(KakaoUserDTO userInfo) {
        // TODO: 필요 시 구현
    }

    // ===== 유틸 =====
    @Override
    public Set<String> parseRoles(String rolesCsv) {
        if (rolesCsv == null || rolesCsv.isBlank()) return Set.of();
        return Arrays.stream(rolesCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }

    @Override
    public boolean matchesPassword(String raw, String hash) {
        return hash != null && passwordEncoder.matches(raw, hash);
    }
}
