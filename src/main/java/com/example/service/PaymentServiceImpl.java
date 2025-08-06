package com.example.service;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import org.apache.hc.client5.http.fluent.Request;
import org.apache.hc.core5.http.ContentType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import com.example.DAO.PaymentRepository;
import com.example.config.TossConfig;
import com.example.dto.PaymentDTO;
import com.example.dto.SubscribeDTO;
import com.example.security.CustomUserDetails;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentServiceImpl implements PaymentService {
	
	private static final String SECRET_KEY1 = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R"; //임시 저장용
	
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Transactional 
    public Map<String, Object> confirmPayment(PaymentDTO req) {
        try {
            // 1. 토스페이먼츠 결제 확인 API 호출
            String credentials = Base64.getEncoder()
                .encodeToString((TossConfig.SECRET_KEY + ":").getBytes(StandardCharsets.UTF_8));
            
            Map<String, Object> body = new HashMap<>();
            body.put("paymentKey", req.getPayment_key());
            body.put("orderId", req.getOrder_id());
            body.put("amount", req.getAmount());
            
            String jsonBody = new ObjectMapper().writeValueAsString(body);
            
            String response = Request.post("https://api.tosspayments.com/v1/payments/confirm")
                .addHeader("Authorization", "Basic " + credentials)
                .addHeader("Content-Type", "application/json")
                .bodyString(jsonBody, ContentType.APPLICATION_JSON)
                .execute()
                .returnContent()
                .asString(Charset.forName("UTF-8"));
            
            Map<String, Object> responseMap = objectMapper.readValue(response, Map.class);
            
            // 2. 토스페이먼츠 응답 검증
            if (!"DONE".equals(responseMap.get("status"))) {
                throw new RuntimeException("결제 확인 실패: " + responseMap.get("status"));
            }
            
            System.out.println("결제 확인 결과");
            System.out.println(responseMap);
            
            // 3. DB에 결제 정보 저장 (트랜잭션 내에서 실행)
            PaymentDTO paymentData = new PaymentDTO();
            SubscribeDTO subscriptionData = new SubscribeDTO();
            
          //결제 테이블에 정보를 세팅(임시)
            //paymentData.setMember_id(req.getMember_id());
            //paymentData.setName(req.getName());
            
            paymentData.setMember_id(2);
            paymentData.setName("테스트결제정보");
            paymentData.setEmail("kkjspdlqj@naver.com");
            
            
            
            paymentData.setOrder_id(req.getOrder_id());
            paymentData.setOrder_name((String)responseMap.get("orderName"));
            paymentData.setPayment_method((String)responseMap.get("method"));
            paymentData.setAmount(req.getAmount());
            paymentData.setPayment_status((String)responseMap.get("status"));
            paymentData.setPayment_key(req.getPayment_key());
            
            //구독 테이블에 정보를 세팅
            subscriptionData.setMember_id(2);
            subscriptionData.setPlan_type(req.getPlan_type());         
            subscriptionData.setStatus("ACTIVE");
            subscriptionData.setAmount(req.getAmount());

            paymentRepository.insertPayment(paymentData);
            paymentRepository.insertSubscription(subscriptionData);       
            return responseMap;
            
        } catch (Exception e) {     
            // 트랜잭션 롤백이 자동으로 발생
            Map<String, Object> error = new HashMap<>();
            error.put("error", "결제 처리 실패: " + e.getMessage());
            return error;
        }
    }
    
    
    @Transactional 
    public Map<String, Object> createBillingKey(PaymentDTO payment) {
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
            
        	Map<String, Object> responseMap = objectMapper.readValue(response.body(), Map.class);
            
            SubscribeDTO subscriptionData = new SubscribeDTO();     
            
            //현재 로그인한 id를 받아올 수 없으므로 임시 id를 하드코딩
            //subscriptionData.setMember_id(payment.getMember_id());
            subscriptionData.setMember_id(2);
            subscriptionData.setPlan_type(payment.getPlan_type());         
            subscriptionData.setStatus("ACTIVE");
            subscriptionData.setAmount(payment.getAmount());
            subscriptionData.setBilling_key((String)responseMap.get("billingKey"));
                
            paymentRepository.insertSubscription(subscriptionData);       
            return responseMap;
            
        } catch (Exception e) {     
            Map<String, Object> error = new HashMap<>();
            error.put("error", "빌링키 발급에 실패: " + e.getMessage());
            return error;
        }   	
    }
        
    //매월 1일 00시에 결제한다고 가정
    public void processMonthlyRecurringPayments(PaymentDTO payment) {  
	    HttpRequest request = HttpRequest.newBuilder()
	    		
	    		
	    	    .uri(URI.create("https://api.tosspayments.com/v1/billing/{billingKey}"))
	    	    .header("Authorization", "Basic dGVzdF9za196WExrS0V5cE5BcldtbzUwblgzbG1lYXhZRzVSOg==")
	    	    .header("Content-Type", "application/json")
	    	    .method("POST", HttpRequest.BodyPublishers.ofString("{\"customerKey\":\"x_1_Ug7haEgFWNunRMiHr\",\"amount\":4900,\"orderId\":\"OzUvizU00JRWjiRfrPq27\",\"orderName\":\"연간 프리미엄 구독(자동결제)\",\"customerEmail\":\"customer@email.com\",\"customerName\":\"박토스\",\"taxFreeAmount\":0}"))
	    	    .build();
	    	HttpResponse<String> response;
			try {
				response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
				System.out.println(response.body());
				
						
			} catch (IOException | InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
	    	      
    }
    
    
}