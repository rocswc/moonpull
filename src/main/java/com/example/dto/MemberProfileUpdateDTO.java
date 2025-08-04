package com.example.dto;

import lombok.Data;

@Data
public class MemberProfileUpdateDTO {
    private Integer userId;
    private String email;
    private String phone;
    private String newPassword;
}
