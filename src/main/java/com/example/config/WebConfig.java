package com.example.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 정적 파일 경로 매핑 (이미지, PDF 등)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:D:/uploads/");
    }

    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        // PDF 확장자 → application/pdf MIME 타입 명시
        configurer.mediaType("pdf", MediaType.APPLICATION_PDF);
    }
}
