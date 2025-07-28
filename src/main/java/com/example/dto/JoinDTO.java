package com.example.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class JoinDTO {

    @JsonProperty("login_id")
    private String loginid;

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

    @JsonProperty("national_id")
    private String nationalid;

    @JsonProperty("phone_number")
    private String phonenumber;

    @JsonProperty("email")
    private String email;

    @JsonProperty("university")
    private String university;

    @JsonProperty("major")
    private String major;

    // 이건 파일이라 JSON에는 없지만, Multipart로 따로 보내므로 그대로 둠
    private MultipartFile graduationFile;
}
