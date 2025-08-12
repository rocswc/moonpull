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
        // TODO: 카카오 사용자 정보로 회원가입/로그인 처리
    }

    @Override
    public boolean existsBySocialIdAndType(String socialId, String socialType) {
        // 리포지토리에 existsBy... 가 없으니 find + isPresent 사용 (효율 개선 원하면 repo에 existsBy... 추가)
        return userRepository.findBySocialIdAndSocialType(socialId, socialType).isPresent();
    }

    @Override
    public Optional<MemberVO> getBySocialIdAndType(String socialId, String socialType) {
        return userRepository.findBySocialIdAndSocialType(socialId, socialType);
    }
}
