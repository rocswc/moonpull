package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import com.example.dto.JoinDTO;
import com.example.util.Aes256Util;

@Service // 이 클래스가 스프링의 서비스 컴포넌트임을 명시
public class JoinServiceImpl implements JoinService {

    private final UserRepository userRepository; // 사용자 정보를 DB에 저장하기 위한 JPA 레포지토리
    private final BCryptPasswordEncoder bCryptPasswordEncoder; // 비밀번호 암호화 도구
    private final Aes256Util aes256Util; // 주민등록번호 암호화 유틸

    @Autowired
    public JoinServiceImpl(UserRepository userRepository,
                           BCryptPasswordEncoder bCryptPasswordEncoder,
                           Aes256Util aes256Util) {
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.aes256Util = aes256Util;
    }

    @Override
    public void joinProcess(JoinDTO joinDTO) {
        // 사용자 정보 객체 생성
        MemberVO user = new MemberVO();

        // 소셜 로그인 여부 설정
        user.setIsSocial(joinDTO.getIsSocial() != null && joinDTO.getIsSocial());

        if (user.getIsSocial()) {
            // 소셜 로그인인 경우: 로그인 ID, 비밀번호는 필요 없음
            user.setSocialType(joinDTO.getSocialType());
            user.setSocialId(joinDTO.getSocialId());
            user.setLoginid(null);
            user.setPasswordhash(null);
        } else {
            // 일반 로그인인 경우: 로그인 ID 및 암호화된 비밀번호 설정
            user.setLoginid(joinDTO.getLoginid());
            user.setPasswordhash(bCryptPasswordEncoder.encode(joinDTO.getPassword()));
        }

        // 공통 사용자 정보 설정
        user.setName(joinDTO.getName());
        user.setNickname(joinDTO.getNickname());
        user.setRoles("ROLE_" + joinDTO.getRoles());
        user.setPhonenumber(joinDTO.getPhonenumber());
        user.setEmail(joinDTO.getEmail());
        user.setUniversity(joinDTO.getUniversity());
        user.setMajor(joinDTO.getMajor());
        user.setGraduationFile(joinDTO.getGraduationFile());

        // 주민등록번호 암호화 처리
        String encryptedNationalId = aes256Util.encrypt(joinDTO.getNationalid());
        if (encryptedNationalId == null) {
            throw new IllegalStateException("주민등록번호 암호화에 실패했습니다."); // 회원가입 중단
        }
        user.setNationalid(encryptedNationalId); // 암호화 성공 시 저장

        // 사용자 정보 저장
        userRepository.save(user);
    }
}
