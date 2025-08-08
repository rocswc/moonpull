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
    public ResponseEntity<?> confirmPayment(@RequestBody PaymentDTO request,  @AuthenticationPrincipal CustomUserDetails userDetails) {
	
    	System.out.println("컨펌을 받아요!!!2!");
    	Integer userId = userDetails.getUserId(); //현재 로그인한 사용자의 userId(PK)를 가져오는code
    	System.out.println(userId);
    	

    	Object result = paymentService.confirmPayment(request);
    	ResponseEntity<?> response = ResponseEntity.ok(result);
        return response;
    }
    
    @PostMapping("/create_billing_key")
    public ResponseEntity<?> createBillingKey(@RequestBody PaymentDTO payment, @AuthenticationPrincipal CustomUserDetails user) { 
    	//현재 user의 값이 null이 나오기 때문에 로그인정보를 가져올수 없기에 임시로 하드코딩으로 insert하고 있음
    	//payment.setMember_id(user.getUserId());
    	//plan_type=null,
    	
    	System.out.println("빌링키 테스트1234");
    	System.out.println(payment.toString());
    	Object result = paymentService.createBillingKey(payment);    
    	ResponseEntity<?> response = ResponseEntity.ok(result);    	
        return response;
    }
    	
}