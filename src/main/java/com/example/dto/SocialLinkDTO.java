package com.example.dto;

public class SocialLinkDTO {
    private String loginId;
    private String password;
    private String socialType;
    private String socialId;
    private String phone;
    private String linkTicket;

    public SocialLinkDTO() {}

    public SocialLinkDTO(String loginId, String password, String socialType, String socialId, String phone, String linkTicket) {
        this.loginId = loginId;
        this.password = password;
        this.socialType = socialType;
        this.socialId = socialId;
        this.phone = phone;
        this.linkTicket = linkTicket;
        
    }

    public String getLoginId() { return loginId; }
    public void setLoginId(String loginId) { this.loginId = loginId; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getSocialType() { return socialType; }
    public void setSocialType(String socialType) { this.socialType = socialType; }
    public String getSocialId() { return socialId; }
    public void setSocialId(String socialId) { this.socialId = socialId; }
    public String getPhone() { return phone; }  // ✅ 추가된 getter
    public void setPhone(String phone) { this.phone = phone; } // ✅ 추가된 setter
    public String getLinkTicket() { return linkTicket; }
    public void setLinkTicket(String linkTicket) { this.linkTicket = linkTicket; }
}

