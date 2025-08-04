package com.example.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.dto.PaymentDTO;
import com.example.service.PaymentService;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = {
	    "http://localhost:8888",
	    "http://127.0.0.1:8888",
	    "http://192.168.0.184:8888",
	    "http://192.168.56.1:8888"
	})
public class PaymentController {

	@Autowired	
    private PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
    
    @PostMapping(value = "/confirm", produces = "application/json; charset=UTF-8")
    public ResponseEntity<?> confirmPayment(@RequestBody PaymentDTO request) {
    	System.out.println(request);

    	Object result = paymentService.confirmPayment(request);
    	ResponseEntity<?> response = ResponseEntity.ok(result);
    	System.out.println(response);
    				
        return response;   
    }
    
}