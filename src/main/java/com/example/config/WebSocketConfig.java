package com.example.config;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

import com.example.jwt.JwtProvider;

import java.security.Principal;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtProvider jwtProvider;

    public WebSocketConfig(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        System.out.println("✅ [WS 설정] 메시지 브로커 등록됨");
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        System.out.println("✅ [WS 설정] STOMP 엔드포인트 등록됨: /wss");

        registry.addEndpoint("/wss")
            .setAllowedOriginPatterns(
                "https://localhost:*",
                "https://192.168.0.184:*",
                "https://192.168.56.1:*"
            )
            .addInterceptors(
                new HttpSessionHandshakeInterceptor(),
                new HandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
                        if (request instanceof ServletServerHttpRequest servletRequest) {
                            HttpServletRequest req = servletRequest.getServletRequest();
                            String token = req.getHeader("Authorization");

                            if (token != null && token.startsWith("Bearer ")) {
                                token = token.substring(7);
                                Authentication auth = jwtProvider.getAuthentication(token);
                                SecurityContextHolder.getContext().setAuthentication(auth);
                                attributes.put("SPRING.AUTHENTICATION", auth);
                                System.out.println("✅ [WS JWT 인증 성공] user=" + auth.getName());
                            } else {
                                System.out.println("⚠️ [WS JWT 인증 실패] Authorization 헤더 없음 또는 형식 오류");
                            }
                        }
                        return true;
                    }

                    @Override
                    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                               WebSocketHandler wsHandler, Exception exception) {
                        System.out.println("🔁 [WS 핸드셰이크 완료]");
                    }
                }
            )
            .setHandshakeHandler(new DefaultHandshakeHandler() {
                @Override
                protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler,
                                                  Map<String, Object> attributes) {
                    Authentication auth = (Authentication) attributes.get("SPRING.AUTHENTICATION");
                    if (auth != null) {
                        System.out.println("✅ [WS 핸드셰이크 Principal 설정됨] user=" + auth.getName());
                        return auth;
                    } else {
                        System.out.println("⚠️ [WS 핸드셰이크 Principal 설정 실패] 인증 실패, 기본 사용자 설정");
                        return super.determineUser(request, wsHandler, attributes);  // 기본 사용자 처리
                    }
                  
                }
            })
            .withSockJS()
            .setSessionCookieNeeded(true);
    }

   
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                    MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String loginId = accessor.getFirstNativeHeader("loginId");
                    if (loginId != null) {
                        accessor.setUser(() -> loginId); // Principal로 세팅
                    }
                }
                return message;
            }
        });
    }

}
