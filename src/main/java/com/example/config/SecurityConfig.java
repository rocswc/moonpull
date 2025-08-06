package com.example.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

import com.example.DAO.UserRepository;
import com.example.jwt.JwtFilter;
import com.example.jwt.JwtUtil;
import com.example.jwt.LoginFilter;
import com.example.security.CustomAccessDeniedHandler;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

   private final AuthenticationConfiguration authenticationConfiguration;
   private final JwtUtil jwtUtil;
   private final UserRepository userRepository;

   public SecurityConfig(
       AuthenticationConfiguration authenticationConfiguration,
       JwtUtil jwtUtil,
       UserRepository userRepository // ✅ 매개변수에 추가
   ) {
       this.authenticationConfiguration = authenticationConfiguration;
       this.jwtUtil = jwtUtil;
       this.userRepository = userRepository; // ✅ 정상 초기화
   }

    // AuthenticationManager
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    // Password encoder
    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CORS 설정: 네가 쓰던 CorsFilter 그대로 유지
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(
               "http://localhost:3000",
               "http://localhost:8888",
               "http://192.168.56.1:8888",
               "http://192.168.0.27:8888"
           ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // 필요하면 명시적으로: List.of("Content-Type","X-XSRF-TOKEN","Authorization")
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        // 참고: HttpOnly 쿠키는 JS에서 읽을 수 없으므로 Set-Cookie 노출 여부는 큰 의미 없음
        config.setExposedHeaders(List.of("Set-Cookie"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    // Security Filter Chain
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 네 CorsFilter 빈이 있으니 여기서는 기본 활성화만
            .cors(cors -> {})
            // 지금은 프론트 수정 없이 바로 쓰게 CSRF 비활성화
            .csrf(csrf -> csrf.disable())
            .formLogin(form -> form.disable())
            .httpBasic(httpBasic -> httpBasic.disable())
            .headers(headers -> headers.frameOptions().sameOrigin())

            // JWT 로그인/검증 필터 등록  
            .addFilterAt(new LoginFilter(authenticationManager(authenticationConfiguration), jwtUtil, userRepository), UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(new JwtFilter(jwtUtil, userRepository), UsernamePasswordAuthenticationFilter.class)


            // 인가 규칙
            .authorizeHttpRequests(auth -> auth
                // 프리플라이트
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/admin/spam-stats").permitAll()
                // 공개 엔드포인트
                .requestMatchers(
                        "/",
                        "/api/login",
                        "/api/join",
                        "/api/profile/check-email",
                        "/api/profile/check-phone",                      
                        "/api/check-duplicate",
                        "/api/keywords/trending",
                        "/api/keywords/autocomplete",
                        "/api/kibana/**"
                ).permitAll() 
                .requestMatchers("/api/admin/reports").permitAll()
                	
                .requestMatchers(HttpMethod.POST, "/api/admin/report").permitAll()
                
                
                .requestMatchers(HttpMethod.GET, "/users/all").permitAll()
                
                
                   .requestMatchers("/apply/mentor").hasAnyRole("MENTEE", "ADMIN")       
                   .requestMatchers("/api/admin/**").hasRole("ADMIN")
                   .requestMatchers("/admin/**").permitAll()
                 //.requestMatchers("/admin/**").hasRole("ADMIN")
                 //.requestMatchers("/mentor/**").hasAnyRole("MENTOR", "ADMIN")
                   .requestMatchers("/mentee/**").permitAll()        
                   //.requestMatchers("/mentee/**").hasAnyRole("MENTEE", "ADMIN")
                   .requestMatchers("/payments/**").permitAll()
                   .requestMatchers(HttpMethod.POST, "/api/chat/log").permitAll()
                   .requestMatchers(HttpMethod.GET, "/api/user").authenticated()
                   .requestMatchers(HttpMethod.POST, "/api/profile/update").authenticated() // 프로필 수정 인증 필요
                 
                   // 멘토리뷰?
                   .requestMatchers("/api/mentor-review/**").permitAll()
                   .requestMatchers("/mentor-review/**").permitAll()
                   .requestMatchers("/mentorReview/**").permitAll()
                   .requestMatchers("/api/mentoring/accept").permitAll()
                 //추가
                 .requestMatchers("/api/mentoring/progress").authenticated()
                   
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
