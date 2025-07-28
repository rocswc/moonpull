package com.example.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration //스프링설정파일
public class WebCorsConfig {

    @Bean //스프링컨테이너에 등록 객체 생성 관리 및 필요할때 사용
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override				//서버간 충돌나지않게 cors 설정
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")  // API 경로
                        .allowedOrigins("http://localhost:8888", "http://192.168.56.1:8888") 
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowCredentials(true);
            }
        };
    }
}
