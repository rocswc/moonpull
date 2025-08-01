package com.example.service;

import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import com.example.security.CustomUserDetails;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service // 이 클래스가 서비스 레이어 컴포넌트임을 Spring에 알림
public class CustomUserDetailsServiceImpl implements CustomUserDetailsService {

    private final UserRepository userRepository; // DB에서 사용자 정보를 조회하기 위한 JPA 인터페이스

    @Autowired // 생성자 주입으로 userRepository를 전달받음
    public CustomUserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public CustomUserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        MemberVO user = userRepository.findByLoginid(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
   

        return new CustomUserDetails(user);
    }
}
