package com.example.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class RegisterReq {
	 @JsonProperty("userId") 
    private Integer userId; 
	  @JsonProperty("token")// DB랑 매칭 잘 됨
    private String token;
}
