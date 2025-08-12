package com.example.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
@Override
public void configureMessageBroker(MessageBrokerRegistry config) {
 config.enableSimpleBroker("/topic", "/queue");
 config.setApplicationDestinationPrefixes("/app");
 config.setUserDestinationPrefix("/user");
}

@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
 registry.addEndpoint("/ws")
     // 개발 중엔 일단 전부 허용. 문제 해결 후에는 프론트 주소로 좁히세요.
     .setAllowedOriginPatterns("*")
     .withSockJS();
}
}