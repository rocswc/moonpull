package com.example.dto;

import lombok.Data;

@Data
public class ResetPasswordConfirmDTO {
	 private String token;
	 private String password;

}
