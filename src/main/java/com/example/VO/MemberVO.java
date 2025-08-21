package com.example.VO;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "member")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberVO implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "login_id", nullable = true, unique = true, length = 50)
    private String loginid;

    @Column(name = "is_social", nullable = false)
    @Builder.Default
    private Boolean isSocial = false; // ✅ 소셜 여부 (기본값 false)

    @Column(name = "social_type", length = 20)
    private String socialType; // ✅ KAKAO, NAVER, 

    @Column(name = "social_id", length = 100, unique = true)
    private String socialId; // ✅ 소셜 플랫폼 고유 ID

    @Column(nullable = false, length = 36)
    private String name;

    @Column(name = "password_hash", length = 255)
    private String passwordhash;

    @Column(nullable = false, unique = true, length = 30)
    private String nickname;

    @Column(nullable = false, length = 30)
    private String roles;

    @Column(name = "birthday", nullable = false, length = 8)
    private String birthday;

    @Column(name = "gender", nullable = false, length = 1)
    private String gender;

    @Column(name = "phone_number", nullable = false, unique = true, length = 20)
    private String phonenumber;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Builder.Default
    @Column(name = "is_banned", nullable = false)
    private Boolean isBanned = false;

    @Builder.Default
    @Column(name = "ban_reason", nullable = true)
    private String banReason = "";

    @Column(name = "ban_expire_date", nullable = true)
    private Date banExpireDate;

    @Column(length = 100)
    private String university;

    @Column(length = 100)
    private String major;

    @Column(name = "graduation_file", length = 255)
    private String graduationFile;

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    @org.hibernate.annotations.CreationTimestamp
    private LocalDateTime createdat;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "session_version", nullable = false)
    private Integer sessionVersion = 0;
}
