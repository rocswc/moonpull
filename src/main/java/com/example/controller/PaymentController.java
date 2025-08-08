package com.example.controller;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.example.dto.PaymentDTO;
import com.example.dto.SubscribeDTO;
import com.example.security.CustomUserDetails;
import com.example.service.PaymentService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.core.Authentication;

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