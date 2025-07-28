package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import com.example.dto.JoinDTO;
import com.example.util.Aes256Util;

import java.io.File;
import java.io.IOException;

@Service
public class JoinServiceImpl implements JoinService {

    // 의존성 주입: 사용자 정보 저장용 JPA Repository
    private final UserRepository userRepository;

    // 비밀번호 암호화용 객체 (Spring Security 제공)
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    // 주민등록번호 암호화 유틸
    private final Aes256Util aes256Util;

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
        // 1. MemberVO 객체 생성 (DB 저장용)
        MemberVO user = new MemberVO();

        // 2. 소셜 로그인 여부 설정
        user.setIsSocial(joinDTO.getIsSocial() != null && joinDTO.getIsSocial());

        // 3. 로그인 방식에 따라 정보 설정
        if (user.getIsSocial()) {
            // 소셜 로그인인 경우: loginId, password 불필요
            user.setSocialType(joinDTO.getSocialType());
            user.setSocialId(joinDTO.getSocialId());
            user.setLoginid(null);
            user.setPasswordhash(null);
        } else {
            // 일반 로그인인 경우: loginId와 암호화된 password 저장
            user.setLoginid(joinDTO.getLoginid());
            user.setPasswordhash(bCryptPasswordEncoder.encode(joinDTO.getPassword()));
        }

        // 4. 공통 사용자 정보 설정
        user.setName(joinDTO.getName());
        user.setNickname(joinDTO.getNickname());
        user.setRoles("ROLE_" + joinDTO.getRoles()); // 예: ROLE_MENTEE
        user.setPhonenumber(joinDTO.getPhonenumber());
        user.setEmail(joinDTO.getEmail());
        user.setUniversity(joinDTO.getUniversity());
        user.setMajor(joinDTO.getMajor());

        // 5. 졸업증명서 파일 업로드 처리
        MultipartFile graduationFile = joinDTO.getGraduationFile();
        if (graduationFile != null && !graduationFile.isEmpty()) {
            String uploadDir = "uploads/graduation"; // 상대 경로
            String originalFilename = graduationFile.getOriginalFilename(); // 원본 파일명
            String saveFilename = System.currentTimeMillis() + "_" + originalFilename; // 고유 파일명

            File targetFile = new File(uploadDir, saveFilename); // 저장할 파일 객체 생성
            targetFile.getParentFile().mkdirs(); // 디렉토리 없으면 생성

            try {
                graduationFile.transferTo(targetFile); // 실제 파일 저장
                user.setGraduationFile(uploadDir + "/" + saveFilename); // 저장된 경로를 DB에 기록
            } catch (IOException e) {
                throw new RuntimeException("졸업증명서 파일 저장 실패", e);
            }
        } else {
            user.setGraduationFile(null); // 파일이 없으면 null 저장
        }

        // 6. 주민등록번호 암호화
        String encryptedNationalId = aes256Util.encrypt(joinDTO.getNationalid());
        if (encryptedNationalId == null) {
            throw new IllegalStateException("주민등록번호 암호화에 실패했습니다.");
        }
        user.setNationalid(encryptedNationalId);

        // 7. 최종적으로 DB에 사용자 정보 저장
        userRepository.save(user);
    }
}
