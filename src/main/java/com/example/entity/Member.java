package com.example.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "login_id", nullable = false)
    private String loginId;

    @Column(name = "name")
    private String name;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "nickname")
    private String nickname;

    @Column(name = "roles")
    private String roles;

    @Column(name = "birthday")
    private String birthdate;

    /** 전공(major) 필드 추가 */
    @Column(name = "major")
    private String major;
}
