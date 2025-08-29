package com.example.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

/**
 * ✅ 멘토링 채팅방 전용 WebSocket 설정
 * 기존 WebSocket과 분리하여 멘토-멘티 간 실시간 채팅을 위한 설정
 */
@Configuration
@EnableWebSocketMessageBroker
@Slf4j
public class MentoringWebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        System.out.println("✅ [멘토링 WS 설정] 메시지 브로커 등록됨");
        // ✅ 멘토링 채팅 전용 토픽과 큐 설정
        config.enableSimpleBroker("/topic/mentoring", "/queue/mentoring");
        config.setApplicationDestinationPrefixes("/app/mentoring");
        config.setUserDestinationPrefix("/user/mentoring");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        System.out.println("✅ [멘토링 WS 설정] STOMP 엔드포인트 등록됨: /mentoring-ws");

        // ✅ 멘토링 채팅 전용 WebSocket 엔드포인트 (SockJS)
        registry.addEndpoint("/mentoring-ws")
            .setAllowedOriginPatterns(
            		   "https://34.64.84.23:*",
            	        "https://34.64.151.197:*",
            	        "https://34.64.215.144:*"
            )
            .withSockJS();

        // ✅ 네이티브 WebSocket 엔드포인트 (SockJS 없이)
        registry.addEndpoint("/mentoring-ws")
            .setAllowedOriginPatterns(
            		   "https://34.64.84.23:*",
            	        "https://34.64.151.197:*",
            	        "https://34.64.215.144:*"
            );
    }
}
