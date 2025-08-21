package com.example.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.DAO.MemberSocialRepository;      // ⬅ 추가
import com.example.DAO.UserRepository;
import com.example.VO.MemberSocialVO;             // ⬅ 추가
import com.example.VO.MemberVO;
import com.example.dto.SocialLinkDTO;
import com.example.dto.SocialLinkResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SocialLinkServiceImpl implements SocialLinkService {

    private final UserRepository userRepository;
    private final MemberSocialRepository memberSocialRepository;  // ⬅ 추가
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    // 로그인ID + 비번으로 소셜 연동
    @Override
    @Transactional
    public SocialLinkResponse link(SocialLinkDTO dto) {
        MemberVO user = userRepository.findByLoginid(dto.getLoginId())
                .orElseThrow(() -> new IllegalStateException("계정을 찾을 수 없습니다."));

        String storedHash = user.getPasswordhash();
        if (storedHash == null || storedHash.isEmpty()) {
            throw new IllegalStateException("비밀번호가 없어 먼저 비밀번호를 설정해야 합니다.");
        }
        if (!passwordEncoder.matches(dto.getPassword(), storedHash)) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }

        // ⬇ 이미 다른 계정이 점유했는지: member_social에서 확인
        Optional<MemberSocialVO> ownerLink =
                memberSocialRepository.findBySocialTypeAndSocialId(dto.getSocialType(), dto.getSocialId());
        if (ownerLink.isPresent() && !ownerLink.get().getMember().getUserId().equals(user.getUserId())) {
            throw new IllegalStateException("해당 소셜 계정은 이미 다른 계정과 연동되어 있습니다.");
        }

        // ⬇ 멱등 처리: 이미 본인에게 연결돼 있으면 OK, 없으면 새로 insert
        if (ownerLink.isEmpty()) {
            MemberSocialVO link = MemberSocialVO.builder()
                    .member(user)
                    .socialType(dto.getSocialType().trim().toUpperCase())
                    .socialId(dto.getSocialId().trim())
                    .build();
            memberSocialRepository.save(link);
        }

        return new SocialLinkResponse(true, "계정 연동이 완료되었습니다.");
    }

    // 토큰 기반 최종 메서드 (memberId/provider/socialId + 비번)
    @Override
    @Transactional
    public MemberVO verifyPasswordAndLink(Integer memberId, String provider, String socialId, String rawPassword) {
        if (memberId == null) throw new IllegalArgumentException("memberId required");
        if (provider == null || socialId == null) throw new IllegalArgumentException("provider/socialId required");
        if (rawPassword == null || rawPassword.isBlank()) throw new IllegalArgumentException("password required");

        String normProvider = provider.trim().toUpperCase();
        String normSocialId = socialId.trim();

        // ⬇ 행 잠금으로 가져옴 (기존 그대로)
        MemberVO locked = userRepository.lockByUserId(memberId)
                .orElseThrow(() -> new IllegalArgumentException("member not found"));

        String hash = locked.getPasswordhash();
        if (hash == null || !passwordEncoder.matches(rawPassword, hash)) {
            throw new IllegalArgumentException("인증 실패");
        }

     // ⬇ 변경 후 (member_social 기준, 같은 사용자면 OK, 아니면 에러)
        Optional<MemberSocialVO> existing =
                memberSocialRepository.findBySocialTypeAndSocialId(normProvider, normSocialId);

        if (existing.isPresent() && !existing.get().getMember().getUserId().equals(locked.getUserId())) {
            throw new IllegalStateException("이 " + normProvider + " 계정은 이미 다른 회원에 연동되어 있습니다.");
        }

        if (existing.isEmpty()) {
            MemberSocialVO link = MemberSocialVO.builder()
                    .member(locked)
                    .socialType(normProvider)
                    .socialId(normSocialId)
                    .build();
            memberSocialRepository.save(link);
        }

        // ⬇ 세션 무효화 버전 증가만 유지하고 싶다면 여기서 처리
        Integer ver = locked.getSessionVersion() == null ? 0 : locked.getSessionVersion();
        locked.setSessionVersion(ver + 1);
        userRepository.save(locked);

        return locked;
    }
}
