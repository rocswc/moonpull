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
	String testkey = "i5mowkAbLucb9K7FgxTWwON2JmFtGOpoKJH6gleRFGQ=";
	 
	@Autowired	
    private PaymentService paymentService;

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody PaymentDTO request, @AuthenticationPrincipal CustomUserDetails user) {
	
    	System.out.println("컨펌을 받아요!!@!@!");
    	//System.out.println(user.getUsername());
    	//System.out.println(user.getUserId()); 
    	
    	//현재 user의 값이 null이 나오기 때문에 로그인정보를 가져올수 없기에 임시로 하드코딩으로 insert하고 있음
    	//request.setName(user.getUsername());
    	//request.setMember_id(user.getUserId());
    	
    	
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
    

    @PostMapping("/auto_payment")
    public void processAutoPayment(@RequestBody PaymentDTO payment) {
//        HttpRequest request = HttpRequest.newBuilder()
//        	    .uri(URI.create("https://api.tosspayments.com/v1/billing/{billingKey}"))
//        	    .header("Authorization", "Basic dGVzdF9za196WExrS0V5cE5BcldtbzUwblgzbG1lYXhZRzVSOg==")
//        	    .header("Content-Type", "application/json")
//        	    .method("POST", HttpRequest.BodyPublishers.ofString("{\"customerKey\":\"toveCXEwa_CJS_pE8w0tQ\",\"amount\":4900,\"orderId\":\"5ax9qBMJvlrfswcmqmjPn\",\"orderName\":\"토스 프라임 구독\",\"customerEmail\":\"customer@email.com\",\"customerName\":\"박토스\",\"taxFreeAmount\":0}"))
//        	    .build();
//        	HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
//        	System.out.println(response.body());      
    }

    
//    	@PostMapping("/cancel-billing-key")
//        public ResponseEntity<Map<String, Object>> cancelBillingKey(
//            @RequestParam String billingKey,
//            @RequestParam String customerKey
//        ) {
//            Map<String, Object> result = new HashMap<>();
//            
//            try {
//                String encodedAuthHeader = Base64.getEncoder()
//                    .encodeToString((SECRET_KEY1 + ":").getBytes());
//                
//                HttpRequest request = HttpRequest.newBuilder()
//                    .uri(URI.create("https://api.tosspayments.com/v1/billing/authorizations/" + billingKey))
//                    .header("Authorization", "Basic " + encodedAuthHeader)
//                    .header("Content-Type", "application/json")
//                    .method("DELETE", HttpRequest.BodyPublishers.ofString(
//                        String.format("{\"customerKey\":\"%s\"}", customerKey)
//                    ))
//                    .build();
//                
//                HttpResponse<String> response = HttpClient.newHttpClient()
//                    .send(request, HttpResponse.BodyHandlers.ofString());
//                
//                if (response.statusCode() == 200) {
//                    // TODO: DB에서 빌링키 비활성화
//                    // deactivateBillingKeyInDatabase(billingKey);
//                    
//                    result.put("success", true);
//                    result.put("message", "빌링키가 성공적으로 해지되었습니다.");
//                    
//                    return ResponseEntity.ok(result);
//                } else {
//                    result.put("success", false);
//                    result.put("message", "빌링키 해지에 실패했습니다.");
//                    
//                    return ResponseEntity.badRequest().body(result);
//                }
//                
//            } catch (Exception e) {
//                result.put("success", false);
//                result.put("message", "서버 오류가 발생했습니다.");
//                
//                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
//            }
//        }	
    	
}