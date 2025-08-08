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
import java.util.List;
import java.util.Map;
import org.apache.hc.client5.http.fluent.Request;
import org.apache.hc.core5.http.ContentType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.example.DAO.PaymentRepository;
import com.example.config.TossConfig;
import com.example.dto.PaymentDTO;
import com.example.dto.SubscribeDTO;
import com.example.security.CustomUserDetails;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {
	
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
                .encodeToString(("test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R:").getBytes());
             
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
            subscriptionData.setCustomer_key(payment.getCustomerKey());
            
            paymentRepository.insertSubscription(subscriptionData);       
            return responseMap;
            
        } catch (Exception e) {     
            Map<String, Object> error = new HashMap<>();
            error.put("error", "빌링키 발급에 실패: " + e.getMessage());
            return error;
        }   	
    }
      
       
    // 매일 자정에 실행되는 스케줄러에서 호출
    //@Scheduled(cron = "0 0 0 * * *") // 매일 자정 
    //@Scheduled(fixedDelay = 1000) // 이전 실행 완료 후 1초 후 다시 실행(테스트용)
    @Transactional 
    public void processMonthlyRecurringPayments() {
    	
    	
    	System.out.println("김갑중 스케줄링 테스트입니다.");
        String currentUsername = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        System.out.println(currentUsername);
        System.out.println("김갑중 스케줄링 테스트입니다.2");
        
    	 	String orderId = UUID.randomUUID().toString(); //결제API에 보낼 결재고유id
    	 	String orderName = "문풀 프리미엄 자동결제";
    	 		
            // 1. SQL 쿼리로 오늘 결제해야 할 구독자들 조회
    	 	List<SubscribeDTO> subscriptionsToCharge = paymentRepository.findSubscriptionsForToday();

 		 		 		
//    	 	if(subscriptionsToCharge != null) { 	 		
//        	 	//2. 각 구독자별로 결제 처리
//        	 	for (SubscribeDTO subscription : subscriptionsToCharge) {  	    	  
//        	 		try {            	  
//        	 			HttpRequest request = HttpRequest.newBuilder()		
//    	  	    	    .uri(URI.create("https://api.tosspayments.com/v1/billing/"+subscription.getBilling_key()))
//    	  	    	    .header("Authorization", "Basic dGVzdF9za196WExrS0V5cE5BcldtbzUwblgzbG1lYXhZRzVSOg==")
//    	  	    	    .header("Content-Type", "application/json")
//    	  	    	    .method("POST", HttpRequest.BodyPublishers.ofString(
//    	  	    	    		String.format("{\"customerKey\":\"%s\",\"amount\":%d,\"orderId\":\"%s\",\"orderName\":\"%s\",\"customerEmail\":\"%s\",\"customerName\":\"%s\",\"taxFreeAmount\":0}"
//    	  	    	    		,subscription.getCustomer_key(),subscription.getAmount(),orderId,orderName,subscription.getEmail(),subscription.getName())	               	    	    		
//    	  	    	    		))   	    
//    	  	    	    .build();
//        	 			HttpResponse<String> response;
//    	  		
//    	  				response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
//    	  				System.out.println(response.body());
//    	                    	  				
//    	  				//결제가 완료되었으면 결제정보를 결제 테이블에 저장해야 함
//    	  				  	  				   	  				
//    	                  Thread.sleep(100); // API 호출 간격 조절 (선택사항)
//        	 		} catch (Exception e) {
//    	                  System.err.println("구독 ID " + subscription.getSubscription_id() + " 결제 실패: " + e.getMessage());
//    	                  // 개별 결제 실패 시에도 다른 결제는 계속 처리
//        	 		}
//        	 	}	
//    	 		
//    	 	}        
    }
     
    @Transactional
    public void cancelSubscriptionAndPayment(int subscribeId, int memberId) {
    	 System.out.println("➡️ PaymentService 호출됨 - subscribeId: " + subscribeId + ", memberId: " + memberId);
    	 paymentRepository.cancelSubscriptionById(subscribeId);
    	 paymentRepository.cancelPaymentByMemberId(memberId);
        System.out.println("➡️ DB 업데이트 완료 (subscribe, payment)");
    }
    
    public List<Map<String, Object>> getPlanDistribution() {
        return paymentRepository.getPlanDistribution();
    }
    
}