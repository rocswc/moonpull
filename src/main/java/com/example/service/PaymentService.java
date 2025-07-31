package com.example.service;
import java.util.Map;
import com.example.dto.PaymentDTO;

public interface PaymentService {
	public Map<String, Object> confirmPayment(PaymentDTO req);
}
