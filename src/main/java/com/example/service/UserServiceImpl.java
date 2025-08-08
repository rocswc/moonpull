package com.example.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import com.example.dto.KakaoUserDTO;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    @Override
    public void processKakaoLogin(KakaoUserDTO userInfo) {
        // 카카오 사용자 정보로 회원가입 혹은 로그인 처리 로직 작성
    }

    @Override
    public boolean existsBySocialIdAndType(String socialId, String socialType) {
        return userRepository.findBySocialIdAndSocialType(socialId, socialType).isPresent();
    }

    @Override
    public MemberVO findBySocialIdAndType(String socialId, String socialType) {
        return userRepository.findBySocialIdAndSocialType(socialId, socialType)
                .orElse(null); // 또는 예외 던져도 됨
    }
    @Override
    public Optional<MemberVO> getBySocial(String socialType, String socialId) {
        return userRepository.findBySocialIdAndSocialType(socialId, socialType);
    }
}