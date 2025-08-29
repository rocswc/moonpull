package com.example.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.dto.PaymentDTO;
import com.example.service.PaymentService;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = {
		"https://34.64.84.23:*",
        "https://34.64.151.197:*",
        "https://34.64.215.144:*"
	})
public class PaymentController { 
	@Autowired	
    private PaymentService paymentService;

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody PaymentDTO request) {
    	Object result = paymentService.confirmPayment(request);
    	ResponseEntity<?> response = ResponseEntity.ok(result);
        return response;
    }
    
    @PostMapping("/create_billing_key")
    public ResponseEntity<?> createBillingKey(@RequestBody PaymentDTO payment) { 
    	Object result = paymentService.createBillingKey(payment); 
    	ResponseEntity<?> response = ResponseEntity.ok(result);    	
        return response;
    }
    	
}