package com.example.dto;

import lombok.Data;

@Data
public class JoinDTO {
    private String loginid;         // 로그인 아이디 (소셜일 경우 null 허용)
    private String password;        // 비밀번호 (소셜일 경우 null 허용)
    private Boolean isSocial;       // 소셜 로그인 여부 (true: 소셜, false: 일반)
    private String socialType;      // 소셜 타입 (KAKAO, NAVER, GOOGLE)
    private String socialId;        // 소셜 플랫폼 사용자 고유 ID

    private String name;            // 이름
    private String nickname;        // 닉네임 (중복 불가)
    private String roles;           // 권한 (MENTEE, MENTOR, ADMIN)

    private String nationalid;      // 주민등록번호
    private String phonenumber;     // 전화번호
    private String email;           // 이메일

    private String university;      // 대학교명 (선택)
    private String major;           // 전공명 (선택)
    private String graduationFile;  // 졸업증명서 파일 경로 (선택)
}
