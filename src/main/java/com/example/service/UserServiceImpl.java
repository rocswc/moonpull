package com.example.service;

import com.example.VO.MemberVO;
import com.example.DAO.UserRepository;
import com.example.DAO.MemberSocialRepository;   // ⬅️ 추가
import com.example.dto.SocialUserDTO;

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
    private final MemberSocialRepository memberSocialRepository;   // ⬅️ 추가
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           MemberSocialRepository memberSocialRepository, // ⬅️ 추가
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.memberSocialRepository = memberSocialRepository;       // ⬅️ 추가
        this.passwordEncoder = passwordEncoder;
    }

    // ===== 존재 여부 =====
    @Override
    public boolean existsBySocialIdAndType(String socialId, String socialType) {
        // repo 시그니처: existsBySocialTypeAndSocialId(type, id)
        return memberSocialRepository.existsBySocialTypeAndSocialId(socialType, socialId);
    }

    // ===== 조회 =====
    @Override
    public Optional<MemberVO> getBySocialIdAndType(String socialId, String socialType) {
        // repo 시그니처: findBySocialTypeAndSocialId(type, id)
        return memberSocialRepository
                .findBySocialTypeAndSocialId(socialType, socialId)
                .map(link -> link.getMember());
    }

    @Override
    public Optional<MemberVO> getByEmail(String email) {
        if (email == null) return Optional.empty();
        String normalized = email.trim();
        return userRepository.findByEmailIgnoreCase(normalized)
                .or(() -> userRepository.findByEmail(normalized));
    }

    @Override
    public Optional<MemberVO> getById(Integer id) {
        return userRepository.findById(id);
    }

    // ===== 소셜 처리 (필요 시 구현) =====
    @Override
    public void processKakaoLogin(SocialUserDTO userInfo) {
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
