package com.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean	//보안설정 위한 것(요청 허가,불허)		//SecurityFilterChain 안에서 사용하는 요청별 허용 로그인, cors 설정
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll()  // /api/로 시작하는건 누구나 접근가능
                .anyRequest().authenticated()            // 나머진 인증 필요
            );
           

        return http.build();
    }

    @Bean	// cors설정해서 주소 충돌 및 허용 유무
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:8888", "http://192.168.56.1:8888"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowCredentials(true); // 사용자 인증정보 쿠키, jwt등
        config.addAllowedHeader("*"); //사용자의 모든 헤더를 허용 개발시만 나중에는 정확히 기술
        	//cors가 모든 경로에 있는config를 적용 
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
