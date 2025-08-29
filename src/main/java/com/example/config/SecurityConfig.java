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
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

import com.example.DAO.UserRepository;
import com.example.jwt.JwtFilter;
import com.example.jwt.JwtUtil;
import com.example.jwt.LoginFilter;
import com.example.security.CustomAccessDeniedHandler;
import com.example.service.SessionService;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpSession;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final AuthenticationConfiguration authenticationConfiguration;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final SessionService sessionService;

    public SecurityConfig(
        AuthenticationConfiguration authenticationConfiguration,
        JwtUtil jwtUtil,
        UserRepository userRepository,
        SessionService sessionService
    ) {
        this.authenticationConfiguration = authenticationConfiguration;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.sessionService = sessionService;
    }
 // ✅ 추가한 부분: SESSION 쿠키를 UUID로 저장하기 위한 설정
    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName("MOONPULL_SESSION");
        serializer.setUseBase64Encoding(false);       // ✅ UUID 그대로
        serializer.setSameSite("None");
        serializer.setUseSecureCookie(true);
        serializer.setUseHttpOnlyCookie(true);
      
        return serializer;
    }
    
    

    // 🔐 로그인 인증 관리자
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    // 🔐 비밀번호 암호화
    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 🌐 CORS 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // 정확한 오리진만 나열 (* 금지)
        config.setAllowedOrigins(List.of(
            "http://localhost:8888",
            "https://localhost:8080",
            "http://localhost:3000",
            "http://192.168.56.1:8888",
            "http://192.168.0.27:8888",
            "https://localhost:8888",
            "https://localhost:3000",
            "https://192.168.56.1:8888",
            "https://192.168.0.27:8888",
            "https://34.64.84.23:*",
            "https://34.64.151.197:*",
            "https://34.64.215.144:*"
        ));
        config.setAllowCredentials(true);
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        // 리다이렉트 헤더는 쓰지 말자. Set-Cookie만 노출
        config.setExposedHeaders(List.of("Set-Cookie"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ✅ 로그인 필터 (세션 저장 포함)
    @Bean
    public LoginFilter loginFilter() throws Exception {
        return new LoginFilter(authenticationManager(authenticationConfiguration), jwtUtil, userRepository, sessionService);
    }

    // ✅ JWT 필터 (세션 + 쿠키 검증)
    @Bean
    public JwtFilter jwtFilter() {
        return new JwtFilter(jwtUtil, userRepository, sessionService);
    }

    // ✅ 익명 사용자의 세션 생성을 막는 필터
    @Bean
    public Filter preventSessionCreationForAnonymous() {
        return (ServletRequest request, ServletResponse response, FilterChain chain) -> {
            HttpServletRequest req = (HttpServletRequest) request;
            String uri = req.getRequestURI();
            String method = req.getMethod();

            boolean isApiRequest = uri.startsWith("/api/");
            boolean isAnonymous = req.getSession(false) == null;

            // ✅ 여기를 수정해야 함!! ✅
            boolean allowSession =
                uri.equals("/api/login") ||
                uri.equals("/auth/login") ||
                uri.startsWith("/api/join") ||
                uri.startsWith("/api/auth/social-link") ||
                uri.equals("/api/auth/check-phone") ||
                uri.startsWith("/wss/") ||
                uri.startsWith("/api/rt-chat/") ||
                uri.startsWith("/auth/") || 
                //  요 두 줄 추가!!
                uri.equals("/auth/google/callback") ||
                uri.equals("/auth/kakao/callback");

            // ✅ 인증이 필요한 대표 엔드포인트 (읽기라도 요청저장 필요할 수 있음)
            //    + 쓰기 요청(POST/PUT/DELETE)은 전부 세션 허용
            boolean isWrite = !"GET".equalsIgnoreCase(method);
            if (isWrite ||
                uri.startsWith("/api/user") ||
                uri.startsWith("/api/profile/update") ||
                uri.startsWith("/api/mentoring") ||
                uri.startsWith("/api/me")) {
                allowSession = true;
            }

            if (isAnonymous && isApiRequest && !allowSession) {
                chain.doFilter(new HttpServletRequestWrapper(req) {
                    @Override public HttpSession getSession() { return null; }
                    @Override public HttpSession getSession(boolean create) { return null; }
                }, response);
            } else {
                chain.doFilter(request, response);
            }
        };
    }

    // 🔒 보안 설정
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .formLogin(form -> form.disable())
            .httpBasic(httpBasic -> httpBasic.disable())
            .headers(headers -> headers.frameOptions().sameOrigin())

            // ✅ 하이브리드 방식: 세션 필요시 생성 (로그인 시)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

            // ✅ 필터 등록 순서
            .addFilterBefore(preventSessionCreationForAnonymous(), UsernamePasswordAuthenticationFilter.class)
            .addFilterAt(loginFilter(), UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(jwtFilter(), UsernamePasswordAuthenticationFilter.class)

            // ✅ 접근 규칙
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/favicon.ico").permitAll()
                .requestMatchers("/auth/social-join").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/admin/spam-stats").permitAll()

                .requestMatchers(
                    "/", "/api/login", "/api/join/**", "/api/profile/check-email",
                    "/api/profile/check-phone", "/api/check-duplicate",
                    "/api/keywords/trending", "/api/keywords/autocomplete", "/api/kibana/**"
                ).permitAll()

                .requestMatchers("/api/admin/reports").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/admin/report").permitAll()
                .requestMatchers(HttpMethod.GET, "/users/all").permitAll()

                .requestMatchers("/api/chat/**", "/api/teacher/**", "/api/mentors/**", "/api/mentor/**").permitAll()
                .requestMatchers("/api/moonpull-chat/**").permitAll()  // 성은 문풀 챗봇 API 허용 08/22
                .requestMatchers("/api/mentoring/chatId", "/api/mentoring/chatIdByUserId").permitAll()

                .requestMatchers("/api/mentoring/mentor-id").hasRole("MENTOR")
                .requestMatchers("/api/mentoring/mentorByChatId").permitAll() // ✅ chatId로 멘토 정보 조회 08/18
                .requestMatchers("/api/mentoring/menteeByChatId").permitAll() // ✅ chatId로 멘티 정보 조회 08/18
                .requestMatchers(HttpMethod.POST, "/api/mentoring/request").hasRole("MENTEE")
                .requestMatchers(HttpMethod.GET, "/api/mentoring/requests").hasRole("MENTOR")
                .requestMatchers(HttpMethod.POST, "/api/mentoring/accept-request").hasRole("MENTOR")
                .requestMatchers("/api/mentoring/progress").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/mentoring/terminate/**").authenticated() //8/20

                .requestMatchers("/error/**").permitAll()

                .requestMatchers("/api/mentor-id", "/api/mentor-id/**").hasAnyRole("MENTOR", "ADMIN")

                .requestMatchers("/ws/**", "/api/rt-chat/**").permitAll()
                .requestMatchers("/apply/mentor").hasAnyRole("MENTEE", "ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/admin/**").permitAll()
                .requestMatchers("/payments/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/mentoring/end/**").authenticated() //8/22                            
                .requestMatchers("/auth/**", "/auth/social/finalize").permitAll()
                .requestMatchers("/api/auth/social-link/**").permitAll()           
                
                
                // 구글/카카오 콜백 명시적으로 열고 싶으면 추가(권장)
                .requestMatchers("/auth/google/callback", "/auth/kakao/callback").permitAll()

                .requestMatchers("/api/mentor-review/**", "/mentor-review/**", "/mentorReview/**").permitAll()
                .requestMatchers("/api/mentoring/accept").permitAll()
                .requestMatchers("/api/wrong-answers/**").permitAll()
                
                 // 소셜 전화번호 확인 엔드포인트 허용
                 .requestMatchers(HttpMethod.GET, "/api/auth/check-phone").permitAll()
                 .requestMatchers("/check-phone").permitAll()
                 
                // ✅ 여기 핵심!
                .requestMatchers(HttpMethod.GET, "/api/me").permitAll() // 익명도 접근 가능
                .requestMatchers(HttpMethod.POST, "/api/logout").permitAll()

                .requestMatchers(HttpMethod.GET, "/api/user").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/profile/update").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/mentoring/terminate/**").authenticated() //8/20
                .requestMatchers("/mentoring-ws/**", "/wss/**").permitAll() //8-27 추가
                .requestMatchers("/api/admin/reports/top").permitAll()
                
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/api/files/**").permitAll()
                
                .requestMatchers("/api/password-reset/**").permitAll()
                .requestMatchers("/auth/reset-password/**").permitAll()

                .anyRequest().authenticated()
            )

            // 익명 사용자 세션 방지 + SecurityContext 명시적 저장 해제
            .securityContext(securityContext -> securityContext.requireExplicitSave(false))
            .anonymous(anonymous -> anonymous.disable())

            // 접근 거부 시 핸들러 설정
            .exceptionHandling(ex -> ex.accessDeniedHandler(new CustomAccessDeniedHandler()));

        return http.build();
    }
}
