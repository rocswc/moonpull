// src/main/java/com/example/dto/SocialUserDTO.java
package com.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


//ㅎㅇㅎㅇㅎㅇㅎㅇㅎㅇㅎㅇㅎㅇㅎㅇㅎㅇㅎㅇㅎ

@Data
@NoArgsConstructor
@AllArgsConstructor // (socialId, socialType, email, name, profileImg)
public class SocialUserDTO {
    private String socialId;     // 소셜 고유 ID
    private String socialType;   // "KAKAO" | "NAVER" (없으면 null 가능)
    private String email;        // null 가능
    private String name;         // null 가능
    private String profileImg;   // null 가능

    // 기존 서비스 코드 호환용: socialType 없이 4개 인자 생성자
    public SocialUserDTO(String socialId, String email, String name, String profileImg) {
        this.socialId = socialId;
        this.email = email;
        this.name = name;
        this.profileImg = profileImg;
    }

    // 혹시 getId()로 접근하는 기존 코드가 있으면 대응
    public String getId() {
        return socialId;
        //ㅇㅎㅇㅎㅇㅎㅇㅎㅇㅎㅇㅎ
    }
}
