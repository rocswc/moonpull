package com.example.service;

import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
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
}
