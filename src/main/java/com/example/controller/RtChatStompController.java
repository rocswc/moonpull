package com.example.controller;

import com.example.VO.ChatMessage;
import com.example.service.RtChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;
import java.util.Map;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionConnectEvent;

@Controller
@RequiredArgsConstructor
@Slf4j
public class RtChatStompController {

    private final RtChatService rtChatService;
    private final SimpMessagingTemplate broker;
 
    // clientMsgId 추가
    public static record SendPayload(Long senderId, String content, String clientMsgId) {}

    @MessageMapping("/rooms/{roomId}/send")
    public void send(@DestinationVariable Long roomId, @Payload SendPayload payload) {
        log.info("📩 [수신] roomId={}, senderId={}, content={}", roomId, payload.senderId(), payload.content());

        // 메시지를 DB에 저장
        ChatMessage saved = rtChatService.send(roomId, payload.senderId(), payload.content(), null);
        log.info("💾 [저장됨] msgId={}, roomId={}, senderId={}, content={}",
                saved.getId(), saved.getChatroomId(), saved.getSenderId(), saved.getContent());

        // 1) 방 전체 브로드캐스트
        log.info("📢 [브로드캐스트] → /topic/rooms/{}", roomId);
        broker.convertAndSend("/topic/rooms/" + roomId, saved);

        // 2) 방 참가자 개인 큐 전송
        rtChatService.getParticipants(roomId).forEach(userId -> {
            String loginId = rtChatService.resolveLoginId(userId);
            // 본인이 보낸 메시지는 제외
            if (!userId.equals(payload.senderId())) {
                log.info("📤 convertAndSendToUser → loginId={}, roomId={}, msg={}", loginId, roomId, saved);
                broker.convertAndSendToUser(loginId, "/queue/rooms/" + roomId, saved);
            } else {
                log.info("🙅 보낸 본인은 스킵: userId={}", userId);
            }
        });

        log.info("✅ 메시지 브로드캐스트 완료 roomId={}, msgId={}", roomId, saved.getId());
    }

    /* ✅ 그대로 유지(선택): 프런트에서 직접 ONLINE publish 할 때도 안전하게 처리 */
    @MessageMapping("/presence/online")
    public void online(Principal principal,
                       @Header("simpSessionId") String sessionId /* ← 세션ID를 확실히 받음 */) {
        if (principal == null) {
            log.warn("⚠️ [온라인 상태 변경] principal이 null입니다.");
            return;
        }
        String userId = principal.getName();
        log.info("📡 [온라인 상태 변경 요청] userId={}, sessionId={}", userId, sessionId);

        boolean becameOnline = rtChatService.markOnline(userId, sessionId); // count += 1
        if (becameOnline) {
            log.info("📡 [온라인 처리 완료] userId={}, status=ONLINE", userId);
            broker.convertAndSend("/topic/presence",
                Map.of("status","ONLINE","loginId",userId,"userId",userId,"isOnline",true));
        } else {
            log.warn("⚠️ [온라인 상태 변경 실패] userId={}, sessionId={}", userId, sessionId);
        }
    }

    /* ✅ [수정] 무조건 forceOffline() 말고 ‘해당 세션만’ 감소시켜 마지막일 때만 OFFLINE */
    @MessageMapping("/presence/offline")
    public void offline(Principal principal,
                        @Header("simpSessionId") String sessionId) {
        if (principal == null) {
            log.warn("⚠️ [오프라인 상태 변경] principal이 null입니다.");
            return;
        }
        String userId = principal.getName();
        log.info("📡 [오프라인 상태 변경 요청] userId={}, sessionId={}", userId, sessionId);

        boolean becameOffline = rtChatService.decrement(userId, sessionId); // count -= 1
        if (becameOffline) {
            log.info("📡 [오프라인 처리 완료] userId={}, status=OFFLINE", userId);
            broker.convertAndSend("/topic/presence",
                Map.of("status","OFFLINE","loginId",userId,"userId",userId,"isOnline",false));
        } else {
            log.warn("⚠️ [오프라인 상태 변경 실패] userId={}, sessionId={}", userId, sessionId);
        }
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent e) {
        String sessionId = e.getSessionId();
        String userId = rtChatService.resolveUserBySession(sessionId);
        log.info("🔌 [세션 종료 이벤트] sessionId={}, userId={}", sessionId, userId);

        if (userId == null) {
            log.warn("⚠️ [세션 종료] 해당 userId가 존재하지 않음, sessionId={}", sessionId);
            return;
        }

        boolean becameOffline = rtChatService.decrement(userId, sessionId); // count -= 1
        if (becameOffline) {
            log.info("📡 [오프라인 상태 처리 완료] userId={}, status=OFFLINE", userId);
            broker.convertAndSend("/topic/presence",
                Map.of("userId", userId, "isOnline", false));
        } else {
            log.warn("⚠️ [오프라인 상태 처리 실패] userId={}, sessionId={}", userId, sessionId);
        }
    }
}
