package com.example.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import com.example.dto.SocialLinkDTO;
import com.example.dto.SocialLinkResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SocialLinkServiceImpl implements SocialLinkService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    // 로그인ID + 비밀번호 기반 소셜 연동
    @Override
    @Transactional
    public SocialLinkResponse link(SocialLinkDTO dto) {
        MemberVO user = userRepository.findByLoginid(dto.getLoginId())
                .orElseThrow(() -> new IllegalStateException("계정을 찾을 수 없습니다."));

        if (user.getPasswordhash() == null || user.getPasswordhash().isEmpty()) {
            throw new IllegalStateException("비밀번호가 없어 먼저 비밀번호를 설정해야 합니다.");
        }
        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordhash())) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }

        // 소셜 계정이 이미 다른 계정에 연동되어 있는지 확인
        Optional<MemberVO> existing = userRepository.findBySocialTypeAndSocialId(dto.getSocialType(), dto.getSocialId());
        if (existing.isPresent() && !existing.get().getUserId().equals(user.getUserId())) {
            throw new IllegalStateException("해당 소셜 계정은 이미 다른 계정과 연동되어 있습니다.");
        }

        // 본인 계정에 소셜 정보 연동
        user.setSocialType(dto.getSocialType().trim().toUpperCase());
        user.setSocialId(dto.getSocialId().trim());
        user.setIsSocial(true);
        userRepository.save(user);

        return new SocialLinkResponse(true, "소셜 계정 연동이 완료되었습니다.");
    }

    // memberId + provider + socialId + 비밀번호 기반 연동 (토큰 기반)
    @Override
    @Transactional
    public MemberVO verifyPasswordAndLink(Integer memberId, String provider, String socialId, String rawPassword) {
        if (memberId == null || provider == null || socialId == null || rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("필수 정보가 누락되었습니다.");
        }

        String normProvider = provider.trim().toUpperCase();
        String normSocialId = socialId.trim();

        MemberVO locked = userRepository.lockByUserId(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        if (locked.getPasswordhash() == null || !passwordEncoder.matches(rawPassword, locked.getPasswordhash())) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }

        Optional<MemberVO> existing = userRepository.findBySocialTypeAndSocialId(normProvider, normSocialId);
        if (existing.isPresent() && !existing.get().getUserId().equals(locked.getUserId())) {
            throw new IllegalStateException("해당 소셜 계정은 이미 다른 회원에 연동되어 있습니다.");
        }

        // 연동 수행
        locked.setSocialType(normProvider);
        locked.setSocialId(normSocialId);
        locked.setIsSocial(true);

        // 세션 무효화 (선택)
        Integer version = locked.getSessionVersion() == null ? 0 : locked.getSessionVersion();
        locked.setSessionVersion(version + 1);

        return userRepository.save(locked);
    }
}
