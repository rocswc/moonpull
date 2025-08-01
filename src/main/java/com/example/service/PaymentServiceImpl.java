package com.example.service;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.apache.hc.client5.http.fluent.Request;
import org.apache.hc.core5.http.ContentType;
import org.springframework.stereotype.Service;

import com.example.config.TossConfig;
import com.example.dto.PaymentDTO;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PaymentServiceImpl implements PaymentService {

    public Map<String, Object> confirmPayment(PaymentDTO req) {
        try {
            String credentials = Base64.getEncoder().encodeToString((TossConfig.SECRET_KEY + ":").getBytes(StandardCharsets.UTF_8));
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
                .asString(Charset.forName("UTF-8")); // UTF-8 인코딩 명시적 지정

            return new ObjectMapper().readValue(response, Map.class);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return error;
        }
    }
}