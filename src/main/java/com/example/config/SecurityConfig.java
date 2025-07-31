package com.example.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import com.example.jwt.JwtFilter;
import com.example.jwt.JwtUtil;
import com.example.jwt.LoginFilter;
import com.example.security.CustomAccessDeniedHandler;

@Configuration
@EnableWebSecurity // Spring Security 설정을 활성화
@EnableMethodSecurity(prePostEnabled = true) // @PreAuthorize, @PostAuthorize 등 메서드 보안 어노테이션을 활성화(suhan)
public class SecurityConfig {

	// 인증 설정을 제공하는 객체 (인증 매니저 생성에 필요)
    private final AuthenticationConfiguration authenticationConfiguration;
 // JWT 관련 유틸리티 클래스 (토큰 생성, 검증 등에 사용)
    private final JwtUtil jwtUtil;

 // 생성자 주입 방식으로 필요한 객체들을 전달받음
    public SecurityConfig(AuthenticationConfiguration authenticationConfiguration, JwtUtil jwtUtil) {
        this.authenticationConfiguration = authenticationConfiguration;
        this.jwtUtil = jwtUtil;// JWT 유틸 주입
    }

    // 인증 매니저 빈 등록 (LoginFilter에서 사용됨)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    // 비밀번호 암호화에 사용할 BCrypt 인코더 빈 등록
    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // cors 설정
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:8888", "http://192.168.56.1:8888", "http://192.168.0.27:8888"   ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        
        //  쿠키 응답 헤더를 브라우저가 읽을 수 있도록 허용
        config.setExposedHeaders(List.of("Set-Cookie"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    // 보안 필터 체인 설정
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> {}) // (suhan) CORS 필터 적용
            .csrf(csrf -> csrf.disable()) // (suhan) CSRF 비활성화
            .formLogin(form -> form.disable()) // (suhan) form 로그인 비활성화
            .httpBasic(httpBasic -> httpBasic.disable()) // (suhan) HTTP 기본 인증 비활성화

            // JWT 로그인 필터 등록
            .addFilterAt(new LoginFilter(authenticationManager(authenticationConfiguration), jwtUtil),
                    UsernamePasswordAuthenticationFilter.class)

            // JWT 검증 필터 등록
            .addFilterBefore(new JwtFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class)

            // 인가 설정
            .authorizeHttpRequests(auth -> auth
            	    .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
            	    .requestMatchers("/", "/api/**").permitAll()   // 로그인/회원가입만 공개
            	    .requestMatchers("/mentorReview/**").permitAll()  // ✅ 요거 추가하세요
            	    .requestMatchers("/apply/mentor").hasAnyRole("MENTEE", "ADMIN")	    
            	   
            	    .requestMatchers("/admin/**").permitAll()
            	  //.requestMatchers("/admin/**").hasRole("ADMIN")
            	    .requestMatchers("/mentor/**").permitAll()
            	  //.requestMatchers("/mentor/**").hasAnyRole("MENTOR", "ADMIN")
            	    .requestMatchers("/mentee/**").permitAll() 	    
            	    //.requestMatchers("/mentee/**").hasAnyRole("MENTEE", "ADMIN")
            	    .requestMatchers("/payments/**").permitAll()
            	    .anyRequest().authenticated()// 그 외에는 인증 필요
            	)

            // 접근 거부 처리
            .exceptionHandling(ex ->
                ex.accessDeniedHandler(new CustomAccessDeniedHandler())
            )

            // 세션 비활성화 (JWT 방식)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );

        return http.build();
    }
}
