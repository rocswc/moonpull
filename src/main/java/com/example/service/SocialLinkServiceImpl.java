package com.example.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import com.example.dto.SocialLinkDTO;        // ✅ 대소문자 정확히
import com.example.dto.SocialLinkResponse;  // ✅ 대소문자 정확히

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SocialLinkServiceImpl implements SocialLinkService { // ✅ 클래스명도 정확히

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    // (기존 API 유지) 로그인ID + 비번 입력받아 소셜연동
    @Override
    @Transactional
    public SocialLinkResponse link(SocialLinkDTO dto) { // ✅ 인터페이스 시그니처와 동일
        MemberVO user = userRepository.findByLoginid(dto.getLoginId())
                .orElseThrow(() -> new IllegalStateException("계정을 찾을 수 없습니다."));

        String storedHash = user.getPasswordhash();
        if (storedHash == null || storedHash.isEmpty()) {
            throw new IllegalStateException("비밀번호가 없어 먼저 비밀번호를 설정해야 합니다.");
        }
        if (!passwordEncoder.matches(dto.getPassword(), storedHash)) {
            // 컨트롤러에서 IllegalArgumentException/IllegalStateException handling하므로 맞춤
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }

        // 동일 소셜이 다른 계정에 이미 점유되었는지 확인
        Optional<MemberVO> owner =
            userRepository.findBySocialIdAndSocialType(dto.getSocialId(), dto.getSocialType());
        if (owner.isPresent() && !owner.get().getUserId().equals(user.getUserId())) {
            throw new IllegalStateException("해당 소셜 계정은 이미 다른 계정과 연동되어 있습니다.");
        }

        user.setIsSocial(Boolean.TRUE);
        user.setSocialType(dto.getSocialType());
        user.setSocialId(dto.getSocialId());
        userRepository.save(user);

        return new SocialLinkResponse(true, "계정 연동이 완료되었습니다.");
    }

    // ✅ 토큰 기반 최종 메서드 (memberId/provider/socialId + 비번)
    @Override
    @Transactional
    public MemberVO verifyPasswordAndLink(Integer memberId, String provider, String socialId, String rawPassword) {
        if (memberId == null) throw new IllegalArgumentException("memberId required");
        if (provider == null || socialId == null) throw new IllegalArgumentException("provider/socialId required");
        if (rawPassword == null || rawPassword.isBlank()) throw new IllegalArgumentException("password required");

        String normProvider = provider.trim().toUpperCase();
        String normSocialId = socialId.trim();

        // 같은 트랜잭션에서 락부터
        MemberVO locked = userRepository.lockByUserId(memberId)
                .orElseThrow(() -> new IllegalArgumentException("member not found"));

        // 비번 검증
        String hash = locked.getPasswordhash();
        if (hash == null || !passwordEncoder.matches(rawPassword, hash)) {
            throw new IllegalArgumentException("인증 실패");
        }

        // 점유 검사
        Optional<MemberVO> occupied = userRepository.findBySocialIdAndSocialType(normSocialId, normProvider);
        if (occupied.isPresent() && !occupied.get().getUserId().equals(locked.getUserId())) {
            throw new IllegalStateException("이미 다른 계정에 연동된 소셜입니다");
        }

        // 멱등 업데이트
        boolean same =
            normProvider.equals(locked.getSocialType()) &&
            normSocialId.equals(locked.getSocialId()) &&
            Boolean.TRUE.equals(locked.getIsSocial());

        if (!same) {
            locked.setIsSocial(Boolean.TRUE);
            locked.setSocialType(normProvider);
            locked.setSocialId(normSocialId);
            Integer ver = locked.getSessionVersion() == null ? 0 : locked.getSessionVersion();
            locked.setSessionVersion(ver + 1); // 기존 세션 무효화용
            userRepository.save(locked);
        }

        return locked;
    }
}
