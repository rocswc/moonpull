package com.example.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;

@Component
public class FirebaseInitializerConfig {
	  @PostConstruct
	    public void init() throws IOException {
	        InputStream serviceAccount = getClass().getClassLoader()
	                .getResourceAsStream("firebase-service-account.json"); // ✅ 위치 중요

	        FirebaseOptions options = FirebaseOptions.builder()
	                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
	                .build();

	        if (FirebaseApp.getApps().isEmpty()) {
	            FirebaseApp.initializeApp(options);
	            System.out.println("✅ Firebase 초기화 완료");
	        }
	    }
}
