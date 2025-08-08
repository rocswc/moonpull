package com.example.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class BanRequestDTO {
	  private String loginId;
	    private String reasonCode;
	    private String reasonDetail;
	    private int banDays; // 선택적
	    private LocalDate  endDate; // ISO 

}
