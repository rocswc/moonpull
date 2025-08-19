package com.example.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class FcmPushService {

    public void sendMessage(String targetToken, String title, String body) {
        try {
            Message message = Message.builder()
                    .setToken(targetToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    // ↓ 추가 정보 보내고 싶으면 여기에
                    .putData("click_action", "FLUTTER_NOTIFICATION_CLICK")
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("✅ FCM 푸시 성공 - response: {}", response);

        } catch (Exception e) {
            log.error("❌ FCM 푸시 실패 - error: {}", e.getMessage());
        }
    }
}
