package com.example.service;
import com.example.service.FcmTokenService;
import com.example.VO.FcmTokenVO;
import lombok.RequiredArgsConstructor;
import java.util.List;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class FcmPushService {

    private final FcmTokenService fcmTokenService;

    public void sendMessage(String targetToken, String title, String body) {
        try {
            Message message = Message.builder()
                    .setToken(targetToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putData("click_action", "FLUTTER_NOTIFICATION_CLICK")
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("✅ FCM 푸시 성공 - response: {}", response);
        } catch (Exception e) {
            log.error("❌ FCM 푸시 실패 - error: {}", e.getMessage());
        }
    }

    // 🔽 여기 추가
    public void sendPushToUser(Integer userId, String message) {
        List<FcmTokenVO> tokens = fcmTokenService.tokensOf(userId);
        for (FcmTokenVO token : tokens) {
            sendMessage(token.getToken(), "반복 메시지 감지", message);
        }
    }
}
