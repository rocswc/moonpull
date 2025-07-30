// com.example.dto.LoginDTO
package com.example.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class LoginDTO {
    @JsonAlias({"login_id", "loginId"}) // 둘 다 허용
    private String loginId;
    private String password;
}
