package com.example.service;
import java.util.List;
import java.util.Map;
import com.example.dto.PaymentDTO;

public interface PaymentService {
	public Map<String, Object> confirmPayment(PaymentDTO req); //결제처리
	public Map<String, Object> createBillingKey(PaymentDTO req); //구독용 빌링키 생성 
	public void processMonthlyRecurringPayments(); //월마다 자동결제
	public void cancelSubscriptionAndPayment(int subscribeId, int memberId);
	 public List<Map<String, Object>> getPlanDistribution();
}