package com.example.controller;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.dto.PaymentDTO;
import com.example.service.PaymentService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = {
	    "http://localhost:8888",
	    "http://127.0.0.1:8888",
	    "http://192.168.0.184:8888",
	    "http://192.168.56.1:8888"
	})
public class PaymentController {

	private static final String SECRET_KEY1 = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R";
	
	String testkey = "i5mowkAbLucb9K7FgxTWwON2JmFtGOpoKJH6gleRFGQ=";
	
	
	@Autowired
	private ObjectMapper objectMapper; 
	 
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
    
    @PostMapping("/create_billing_key")
    public ResponseEntity<Map<String, Object>> issueBillingKey(@RequestBody PaymentDTO payment) {
        Map<String, Object> result = new HashMap<>();
        try {
            // Base64 인코딩
            String encodedAuthHeader = Base64.getEncoder()
                .encodeToString((SECRET_KEY1 + ":").getBytes());
             
            System.out.println(payment.getAuthKey());
            System.out.println(payment.getCustomerKey());
            
            // HTTP 요청 생성
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.tosspayments.com/v1/billing/authorizations/issue"))
                .header("Authorization", "Basic " + encodedAuthHeader)
                .header("Content-Type", "application/json")
                .method("POST", HttpRequest.BodyPublishers.ofString(
                    String.format("{\"authKey\":\"%s\",\"customerKey\":\"%s\"}", payment.getAuthKey(), payment.getCustomerKey())
                ))
                .build();
            
            
            System.out.println("빌링키 테스트");
            HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());
            
            System.out.println("빌링키 결과");
            System.out.println(response.body());
            
            if (response.statusCode() == 200) {
                // 성공 시 빌링키 정보 반환
                JsonNode jsonNode = objectMapper.readTree(response.body());
                
                // TODO: 여기서 빌링키를 DB에 저장
                // saveBillingKeyToDatabase(customerKey, jsonNode);
                
                result.put("success", true);
                result.put("message", "빌링키가 성공적으로 발급되었습니다.");
                result.put("billingKey", jsonNode.get("billingKey").asText());
                result.put("card", jsonNode.get("card"));
                
                return ResponseEntity.ok(result);
            } else {
                // 실패 시
                result.put("success", false);
                result.put("message", "빌링키 발급에 실패했습니다.");
                result.put("error", response.body());
                
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "서버 오류가 발생했습니다.");
            result.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
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

    
    	@PostMapping("/cancel-billing-key")
        public ResponseEntity<Map<String, Object>> cancelBillingKey(
            @RequestParam String billingKey,
            @RequestParam String customerKey
        ) {
            Map<String, Object> result = new HashMap<>();
            
            try {
                String encodedAuthHeader = Base64.getEncoder()
                    .encodeToString((SECRET_KEY1 + ":").getBytes());
                
                HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.tosspayments.com/v1/billing/authorizations/" + billingKey))
                    .header("Authorization", "Basic " + encodedAuthHeader)
                    .header("Content-Type", "application/json")
                    .method("DELETE", HttpRequest.BodyPublishers.ofString(
                        String.format("{\"customerKey\":\"%s\"}", customerKey)
                    ))
                    .build();
                
                HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());
                
                if (response.statusCode() == 200) {
                    // TODO: DB에서 빌링키 비활성화
                    // deactivateBillingKeyInDatabase(billingKey);
                    
                    result.put("success", true);
                    result.put("message", "빌링키가 성공적으로 해지되었습니다.");
                    
                    return ResponseEntity.ok(result);
                } else {
                    result.put("success", false);
                    result.put("message", "빌링키 해지에 실패했습니다.");
                    
                    return ResponseEntity.badRequest().body(result);
                }
                
            } catch (Exception e) {
                result.put("success", false);
                result.put("message", "서버 오류가 발생했습니다.");
                
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
            }
        }	
    	
}