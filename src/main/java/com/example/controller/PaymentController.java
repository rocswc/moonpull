package com.example.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.dto.PaymentDTO;
import com.example.service.PaymentService;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = {
	    "https://localhost:8888",
	    "https://127.0.0.1:8888",
	    "https://192.168.0.184:8888",
	    "https://192.168.56.1:8888"
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