package com.example.dto;
import java.util.Date;
import lombok.Data;

@Data
public class SubscribeDTO {
	private Integer subscription_id; //구독 고유 ID
	private Integer member_id;	//구독자 회원 ID
	private String plan_type ; //BASIC,PLUS,PREMIUM
	private String status; //ACTIVE(활성),EXPIRED(만료),CANCELLED(취소),SUSPENDED(정지)
	private Integer amount; //금액
	private Date started_at; //구독 시작일
	private Date expires_at; //구독 만료일
}