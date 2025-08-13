package com.example.dto;

public class SocialLinkDTO {
    private String loginId;
    private String password;
    private String socialType;
    private String socialId;

    public SocialLinkDTO() {}

    public SocialLinkDTO(String loginId, String password, String socialType, String socialId) {
        this.loginId = loginId;
        this.password = password;
        this.socialType = socialType;
        this.socialId = socialId;
    }

    public String getLoginId() { return loginId; }
    public void setLoginId(String loginId) { this.loginId = loginId; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getSocialType() { return socialType; }
    public void setSocialType(String socialType) { this.socialType = socialType; }
    public String getSocialId() { return socialId; }
    public void setSocialId(String socialId) { this.socialId = socialId; }
}
