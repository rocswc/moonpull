package com.example.dto;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;
// 역직렬화란 "문자열(텍스트, JSON, XML 등) 형태의 데이터를 → 객체로 다시 바꾸는 과정"

@Data
@NoArgsConstructor //"매개변수가 없는 기본 생성자" 를 자동으로 만들어줌
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

    private String phone_number;

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

    //  JSON 역직렬화 대상에서 제외
    private MultipartFile graduationFile;
}
