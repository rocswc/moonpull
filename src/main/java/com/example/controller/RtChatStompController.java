package com.example.controller;
import com.example.VO.ChatMessage;
import com.example.service.RtChatService;
import lombok.RequiredArgsConstructor;

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
public class RtChatStompController {

    private final RtChatService rtChatService;
    private final SimpMessagingTemplate broker;
 
    // clientMsgId 추가
    public static record SendPayload(Long senderId, String content, String clientMsgId) {}

    @MessageMapping("/rooms/{roomId}/send")
    public void send(@DestinationVariable Long roomId, @Payload SendPayload payload) {
        ChatMessage saved = rtChatService.send(roomId, payload.senderId(), payload.content(),null);
        broker.convertAndSend("/topic/rooms/" + roomId, saved);  // ← 프론트 구독과 동일
            
    }   
    
    /* ✅ [추가] 세션이 연결되는 ‘순간’ 온라인으로 처리 (즉시 브로드캐스트) */
    @EventListener
    public void onConnect(SessionConnectEvent e) {
        StompHeaderAccessor sha = StompHeaderAccessor.wrap(e.getMessage());
        Principal p = sha.getUser();
        if (p == null) {
            //log.warn("CONNECT without principal, session={}", sha.getSessionId());
            return;
        }
        String userId = p.getName();
        String sessionId = sha.getSessionId();

        boolean becameOnline = rtChatService.markOnline(userId, sessionId); // count += 1
        if (becameOnline) {
            broker.convertAndSend("/topic/presence",
                Map.of("status","ONLINE","loginId",userId,"userId",userId,"isOnline",true));
        }
    }
    
    

    /* ✅ 그대로 유지(선택): 프런트에서 직접 ONLINE publish 할 때도 안전하게 처리 */
    @MessageMapping("/presence/online")
    public void online(Principal principal,
                       @Header("simpSessionId") String sessionId /* ← 세션ID를 확실히 받음 */) {
        if (principal == null) return;
        String userId = principal.getName();

        boolean becameOnline = rtChatService.markOnline(userId, sessionId); // count += 1
        if (becameOnline) {
            broker.convertAndSend("/topic/presence",
                Map.of("status","ONLINE","loginId",userId,"userId",userId,"isOnline",true));
        }
    }


    /* ✅ [수정] 무조건 forceOffline() 말고 ‘해당 세션만’ 감소시켜 마지막일 때만 OFFLINE */
    @MessageMapping("/presence/offline")
    public void offline(Principal principal,
                        @Header("simpSessionId") String sessionId) {
        if (principal == null) return;
        String userId = principal.getName();

        boolean becameOffline = rtChatService.decrement(userId, sessionId); // count -= 1
        if (becameOffline) {
            broker.convertAndSend("/topic/presence",
                Map.of("status","OFFLINE","loginId",userId,"userId",userId,"isOnline",false));
        }
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent e) {
        String sessionId = e.getSessionId();
        String userId = rtChatService.resolveUserBySession(sessionId);
        if (userId == null) return;

        boolean becameOffline = rtChatService.decrement(userId, sessionId); // count -= 1
        if (becameOffline) {
            broker.convertAndSend("/topic/presence",
                Map.of("userId", userId, "isOnline", false));
        }
    }
    
 
}