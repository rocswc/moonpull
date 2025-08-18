package com.example.VO;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class FcmTokenVO {

	
	  private Long tokenId;
	    private Integer userId;
	    private String token;
	    private LocalDateTime createdAt;
	    private LocalDateTime lastUsedAt;

}
