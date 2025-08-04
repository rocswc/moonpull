package com.example.service;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.DAO.MentorRepository;
import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import com.example.VO.MentorVO;
import com.example.dto.JoinDTO;

@Service
public class JoinServiceImpl implements JoinService {

    @Override
    public void saveFile(MultipartFile file) {
        String uploadDir = "D:/졸업증명서";
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String originalFilename = file.getOriginalFilename();
        String safeFilename = UUID.randomUUID().toString() + "_" +
                originalFilename.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");

        File targetFile = new File(dir, safeFilename);
        try {
            file.transferTo(targetFile);
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }
    }

    private final MentorRepository mentorRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    public JoinServiceImpl(MentorRepository mentorRepository,
                           UserRepository userRepository,
                           BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.mentorRepository = mentorRepository;
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    @Override
    public void joinProcess(JoinDTO joinDTO) {
        MemberVO user = new MemberVO();
        user.setIsSocial(joinDTO.getIsSocial() != null && joinDTO.getIsSocial());

        if (user.getIsSocial()) {
            user.setSocialType(joinDTO.getSocialType());
            user.setSocialId(joinDTO.getSocialId());
            user.setLoginid(null);
            user.setPasswordhash(null);
        } else {
            user.setLoginid(joinDTO.getLoginId());
            user.setPasswordhash(bCryptPasswordEncoder.encode(joinDTO.getPassword()));
        }

        // ✅ 공통 정보 세팅
        user.setName(joinDTO.getName());
        user.setNickname(joinDTO.getNickname());
        user.setRoles("ROLE_" + joinDTO.getRoles());
        user.setPhonenumber(joinDTO.getPhoneNumber());
        user.setEmail(joinDTO.getEmail());
        user.setIsBanned(false);
        user.setUniversity(joinDTO.getUniversity());
        user.setMajor(joinDTO.getMajor());

        // ✅ 생년월일 및 성별 설정
        user.setBirthday(joinDTO.getBirthday()); // 예: "19991111"
        user.setGender(joinDTO.getGender());     // 예: "M" 또는 "F"

        // ✅ 졸업증명서 업로드
        MultipartFile graduationFile = joinDTO.getGraduationFile();
        if (graduationFile != null && !graduationFile.isEmpty()) {
            String uploadDir = new File("src/main/resources/static/uploads").getAbsolutePath();
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalFilename = graduationFile.getOriginalFilename();
            String safeFilename = UUID.randomUUID().toString() + "_" +
                    originalFilename.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");

            File targetFile = new File(dir, safeFilename);
            try {
                graduationFile.transferTo(targetFile);
                user.setGraduationFile("/uploads/" + safeFilename);
            } catch (IOException e) {
                throw new RuntimeException("졸업증명서 파일 저장 실패", e);
            }
        } else {
            user.setGraduationFile(null);
        }

        // ❌ 주민등록번호 관련 코드 제거됨

        // ✅ 사용자 저장
        userRepository.save(user);

        // ✅ 멘토 지원자 처리
        if ("MENTOR".equalsIgnoreCase(joinDTO.getRoles())) {
            MentorVO mentor = new MentorVO();
            mentor.setUserId(user.getUserId());
            mentor.setStudentCourse(joinDTO.getUniversity());
            mentor.setSpecialite(joinDTO.getMajor());
            mentor.setIntroduction("관리자 승인 대기 중");
            mentor.setExperienceYear(0);
            mentor.setStatus("PENDING");

            mentorRepository.insertMentorApplication(mentor);
        }
    }
}
