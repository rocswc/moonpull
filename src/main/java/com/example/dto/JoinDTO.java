package com.example.dto;

import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class JoinDTO {

    @JsonProperty("login_id")
    private String loginId;

    @JsonProperty("password")
    private String password;

    @JsonProperty("is_social")
    private Boolean isSocial;

    @JsonProperty("social_type")
    private String socialType;

    @JsonProperty("social_id")
    private String socialId;

    @JsonProperty("name")
    private String name;

    @JsonProperty("nickname")
    private String nickname;

    @JsonProperty("roles")
    private String roles;

    @JsonProperty("phone_number")
    private String phoneNumber;

    @JsonProperty("email")
    private String email;

    @JsonProperty("university")
    private String university;

    @JsonProperty("major")
    private String major;

    @JsonProperty("birthday")
    private String birthday; // 생년월일 (예: "19991111")

    @JsonProperty("gender")
    private String gender; // 성별 ("M" 또는 "F")

    private MultipartFile graduationFile;
}
