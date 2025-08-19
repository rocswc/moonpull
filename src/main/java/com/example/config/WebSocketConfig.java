package com.example.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;
import org.springframework.messaging.Message;                    // Message
import org.springframework.security.core.Authentication;

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
      .setAllowedOriginPatterns(
          "https://localhost:*",
          "http://localhost:*",          // ✅ http도 허용(개발용)
          "https://192.168.0.184:*",
          "http://192.168.0.184:*",
          "https://192.168.56.1:*",
          "http://192.168.56.1:*")
      // ✅ 핸드셰이크 단계에서 Principal 보강 (fallback)
      .setHandshakeHandler(new org.springframework.web.socket.server.support.DefaultHandshakeHandler() {
        @Override
        protected java.security.Principal determineUser(
            org.springframework.http.server.ServerHttpRequest request,
            org.springframework.web.socket.WebSocketHandler wsHandler,
            java.util.Map<String, Object> attributes) {
          org.springframework.security.core.Authentication auth =
              org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
          if (auth != null) return auth; // 현재 로그인 보안 주체 사용
          return super.determineUser(request, wsHandler, attributes);
        }
      })
      .addInterceptors(new HttpSessionHandshakeInterceptor())
      .withSockJS()
      .setSessionCookieNeeded(true); // ✅ JSESSIONID 전달
  }

  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(new ChannelInterceptor() {
      @Override
      public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (acc != null && StompCommand.CONNECT.equals(acc.getCommand())) {
          Authentication auth = SecurityContextHolder.getContext().getAuthentication();
          if (auth != null && acc.getUser() == null) {
            acc.setUser(auth); // ✅ STOMP 세션에 인증 주체 연결
          }
        }
        return message;
      }
    });
  }
}