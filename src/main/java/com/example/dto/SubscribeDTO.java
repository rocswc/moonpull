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
	private String customer_key; //고객 자체를 식별하는 키 (한 고객이 여러 빌링키 보유 가능)
	private String billing_key; //특정 결제수단(카드)에 대한 암호화 키
	
	private String name; // 고객 자체를 식별하는 키 (한 고객이 여러 빌링키 보유 가능)
	private String email; // 특정 결제수단(카드)에 대한 암호화 키
}