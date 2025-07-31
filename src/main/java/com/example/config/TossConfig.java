package com.example.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TossConfig {
    public static String SECRET_KEY;

    @Value("${toss.secret-key:default-key}")
    public void setSecretKey(String key) {
        SECRET_KEY = key;
    }
}