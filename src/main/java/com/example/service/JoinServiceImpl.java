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
import com.example.util.Aes256Util;

@Service
public class JoinServiceImpl implements JoinService {
	
	@Override
	public void saveFile(MultipartFile file) {
	    // 예: D:/졸업증명서 에 저장하는 로직 구현
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
    private final Aes256Util aes256Util;

    @Autowired
    public JoinServiceImpl(MentorRepository mentorRepository,
    						UserRepository userRepository,
                           BCryptPasswordEncoder bCryptPasswordEncoder,
                           Aes256Util aes256Util) {
    	this.mentorRepository =mentorRepository;
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.aes256Util = aes256Util;
    }

    @Override
    public void joinProcess(JoinDTO joinDTO) {
        // 1. DB 저장용 회원 객체 생성
        MemberVO user = new MemberVO();

        // 2. 소셜 로그인 여부 세팅
        user.setIsSocial(joinDTO.getIsSocial() != null && joinDTO.getIsSocial());

        // 3. 로그인 방식에 따른 처리
        if (user.getIsSocial()) {
            // 소셜 로그인인 경우 아이디, 비밀번호 null 처리
            user.setSocialType(joinDTO.getSocialType());
            user.setSocialId(joinDTO.getSocialId());
            user.setLoginid(null);
            user.setPasswordhash(null);
        } else {
            // 일반 로그인: 아이디 및 비밀번호 암호화 후 저장
            user.setLoginid(joinDTO.getLoginId());
            user.setPasswordhash(bCryptPasswordEncoder.encode(joinDTO.getPassword()));
        }

        // 4. 공통 사용자 정보 세팅
        user.setName(joinDTO.getName());
        user.setNickname(joinDTO.getNickname());
        user.setRoles("ROLE_" + joinDTO.getRoles()); // 예: ROLE_MENTEE
        user.setPhonenumber(joinDTO.getPhoneNumber());
        user.setEmail(joinDTO.getEmail());
        user.setIsBanned(false); // 가입 시 기본 차단 해제
        user.setUniversity(joinDTO.getUniversity());
        user.setMajor(joinDTO.getMajor());

     // 5. 졸업증명서 파일 업로드 처리 (STS 내부 경로)
        MultipartFile graduationFile = joinDTO.getGraduationFile();
        if (graduationFile != null && !graduationFile.isEmpty()) {
            // STS4 프로젝트 내부에 저장할 경로
            String uploadDir = new File("src/main/resources/static/uploads").getAbsolutePath();

            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalFilename = graduationFile.getOriginalFilename();
            String safeFilename = UUID.randomUUID().toString() + "_"
                + originalFilename.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");

            File targetFile = new File(dir, safeFilename);

            try {
                graduationFile.transferTo(targetFile);

                // 💡 DB에는 상대경로 저장해두면 frontend에서 static 하위에 접근 가능
                user.setGraduationFile("/uploads/" + safeFilename);
            } catch (IOException e) {
                throw new RuntimeException("졸업증명서 파일 저장 실패", e);
            }
        } else {
            user.setGraduationFile(null);
        }


        // 6. 주민등록번호 AES256 암호화 후 저장
        String encryptedNationalId = aes256Util.encrypt(joinDTO.getNationalId());
        if (encryptedNationalId == null) {
            throw new IllegalStateException("주민등록번호 암호화에 실패했습니다.");
        }
        user.setNationalid(encryptedNationalId);

        // 7. DB에 회원 정보 저장  
        userRepository.save(user);
    
    // 8. 멘토일 경우 mentor 테이블에 추가
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