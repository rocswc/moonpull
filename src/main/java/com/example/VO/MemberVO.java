package com.example.VO;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity // 이 클래스가 JPA 엔티티임을 명시 (DB 테이블과 매핑됨)
@Table(name = "member") // 실제 매핑될 DB 테이블 이름을 "member"로 지정
@Data // Lombok: Getter, Setter, toString, equals, hashCode 자동 생성
@NoArgsConstructor // 기본 생성자 자동 생성
@AllArgsConstructor // 모든 필드를 인자로 받는 생성자 자동 생성
@Builder // 빌더 패턴 지원 (UserEntity.builder().loginid("abc")...)
public class MemberVO {

    @Id // 기본 키(primary key)로 설정
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment 전략
    @Column(name = "user_id") // DB 컬럼명과 매핑
    private Integer userId; // 회원 고유 번호 (PK)

    @Column(name = "login_id", nullable = false, unique = true, length = 50)
    private String loginid; // 로그인용 아이디 (필수, 중복 불가)

    @Column(name = "is_social")
    private Boolean isSocial; // 소셜 로그인 여부 (true = 소셜, false = 일반)

    @Column(name = "social_type", length = 20)
    private String socialType; // 소셜 플랫폼 종류 (예: KAKAO, NAVER, GOOGLE)

    @Column(name = "social_id", unique = true, length = 100)
    private String socialId; // 소셜 플랫폼 사용자 고유 ID

    @Column(nullable = false, length = 36)
    private String name; // 이름 (필수)

    @Column(name = "password_hash", length = 255)
    private String passwordhash; // 비밀번호 해시값 (소셜 로그인 시 NULL 가능)

    @Column(nullable = false, unique = true, length = 10)
    private String nickname; // 닉네임 (필수, 중복 불가, 최대 10자)

    @Column(nullable = false, length = 30)
    private String roles; // 권한 정보 (예: MENTEE, MENTOR, ADMIN)

    // ✅ 주민등록번호 제거하고 생년월일 및 성별 추가
    @Column(name = "birthday", nullable = false, length = 8)
    private String birthday; // 생년월일 (예: 19991111)

    @Column(name = "gender", nullable = false, length = 1)
    private String gender; // 성별 (예: 'M', 'F')

    @Column(name = "phone_number", nullable = false, unique = true, length = 20)
    private String phonenumber; // 전화번호 (필수, 중복 불가)

    @Column(nullable = false, unique = true, length = 100)
    private String email; // 이메일 주소 (필수, 중복 불가)
    
    @Builder.Default  //임시
    @Column(name = "is_banned", nullable = false)
    private Boolean isBanned = false;

    @Column(length = 100)
    private String university; // 대학교명 (선택)

    @Column(length = 100)
    private String major; // 전공명 (선택)

    @Column(name = "graduation_file", length = 255)
    private String graduationFile; // 졸업증명서 파일 경로 (선택)

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    @org.hibernate.annotations.CreationTimestamp
    private LocalDateTime createdat; // 가입 일시 (자동 생성)
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
}
