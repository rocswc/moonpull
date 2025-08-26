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
        // 1. 입력값 기본 검증
        if (dto.getLoginId() == null || dto.getPassword() == null || dto.getPhone() == null) {
            throw new IllegalArgumentException("필수값이 누락되었습니다.");
        }

        // 2. 전화번호로 회원 조회 (전화번호가 일치해야만 진행 가능)
        MemberVO phoneOwner = userRepository.findByPhonenumber(dto.getPhone().trim())
                .orElseThrow(() -> new IllegalStateException("입력한 전화번호와 일치하는 계정이 없습니다."));

        // 3. 로그인 ID 일치 여부 확인
        if (!phoneOwner.getLoginid().equals(dto.getLoginId().trim())) {
            throw new IllegalStateException("입력한 로그인 ID가 전화번호와 일치하지 않습니다.");
        }

        // 4. 비밀번호 검증
        if (phoneOwner.getPasswordhash() == null || !passwordEncoder.matches(dto.getPassword(), phoneOwner.getPasswordhash())) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }

        // 5. 이미 다른 계정에 연동된 소셜인지 확인
        Optional<MemberVO> existing = userRepository.findBySocialTypeAndSocialId(dto.getSocialType(), dto.getSocialId());
        if (existing.isPresent() && !existing.get().getUserId().equals(phoneOwner.getUserId())) {
            throw new IllegalStateException("해당 소셜 계정은 이미 다른 계정과 연동되어 있습니다.");
        }

        // 6. 본인 계정에 소셜 연동
        phoneOwner.setSocialType(dto.getSocialType().trim().toUpperCase());
        phoneOwner.setSocialId(dto.getSocialId().trim());
        phoneOwner.setIsSocial(true);

        userRepository.save(phoneOwner);

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
