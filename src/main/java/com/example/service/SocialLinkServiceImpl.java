package com.example.service;

import com.example.dto.SocialLinkDTO;
import com.example.dto.SocialLinkResponse;
import com.example.VO.MemberVO; // 패키지 네이밍 VO 주의
import com.example.DAO.UserRepository; // 네 프로젝트 Repo 패키지에 맞게
import com.example.service.SocialLinkService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SocialLinkServiceImpl implements SocialLinkService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // 없으면 null 주입되게 하거나 평문비교(임시)

    public SocialLinkServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public SocialLinkResponse link(SocialLinkDTO dto) {
        // 1) 일반 계정 조회 (필드명이 loginid 이므로 findByLoginid)
        MemberVO user = userRepository.findByLoginid(dto.getLoginId())
                .orElseThrow(() -> new IllegalStateException("계정을 찾을 수 없습니다."));

        // 2) 비밀번호 검증 (엔티티는 passwordhash, 게터는 getPasswordhash)
        String storedHash = user.getPasswordhash(); // 소셜-only면 null일 수 있음
        if (storedHash == null || storedHash.isEmpty()) {
            throw new IllegalStateException("비밀번호가 없어 먼저 비밀번호를 설정해야 합니다.");
        }

        boolean passOk = (passwordEncoder != null)
                ? passwordEncoder.matches(dto.getPassword(), storedHash)
                : storedHash.equals(dto.getPassword()); // 인코더 없을 때 임시(권장X)

        if (!passOk) {
            throw new SecurityException("비밀번호가 올바르지 않습니다.");
        }

        // 3) 소셜 ID 중복 연동 방지
        MemberVO owner = userRepository
        	    .findBySocialIdAndSocialType(dto.getSocialId(), dto.getSocialType())
        	    .orElse(null);

        	if (owner != null && !owner.getUserId().equals(user.getUserId())) {
        	    throw new IllegalStateException("해당 소셜 계정은 이미 다른 계정과 연동되어 있습니다.");
        	}

        // 4) 연동 적용 (isSocial은 Boolean)
        user.setIsSocial(Boolean.TRUE);
        user.setSocialType(dto.getSocialType());
        user.setSocialId(dto.getSocialId());
        userRepository.save(user);

        return new SocialLinkResponse(true, "계정 연동이 완료되었습니다.");
    }
}
