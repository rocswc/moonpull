package com.example.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.DAO.ChatMessageDocRepo;
import com.example.DAO.ChatRoomRepository;
import com.example.VO.ChatMessage;
import com.example.VO.ChatRoom;
import com.mongodb.lang.Nullable;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;

@Service 
@RequiredArgsConstructor
public class RtChatServiceImpl implements RtChatService {

    private final ChatRoomRepository roomRepository;
    private final ChatMessageDocRepo messageRepo;
    private final MongoTemplate mongoTemplate;

    private final ConcurrentMap<String, Integer> onlineCount = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, String> sessionToUser = new ConcurrentHashMap<>();
    
    @Transactional
    public ChatRoom createRoomIfAbsent(long a, long b, String field) {
        long uMin = Math.min(a, b);
        long uMax = Math.max(a, b);
        ChatRoom found = roomRepository.findByPair(uMin, uMax);
        if (found != null) return found;

        ChatRoom room = new ChatRoom();
        room.setParticipant1_Id(uMin);
        room.setParticipant2_Id(uMax);
        room.setField(field);
        roomRepository.insert(room);
        return room;
    }

    // 메시지 전송
    public ChatMessage send(long roomId, long senderId, String content, @Nullable String clientMsgId) {
        ChatMessage doc = new ChatMessage();
        doc.setChatroomId(roomId);
        doc.setSenderId(senderId);
        doc.setContent(content);
        doc.setCreatedAt(Instant.now());
        doc.setIsRead(false);  

        // save 시 Mongo가 ObjectId를 만들고, Spring Data가 그 값을 String으로 채워서 반환
        ChatMessage saved = messageRepo.save(doc);
        return saved; // saved.getId()에 Mongo가 만든 _id 문자열이 들어있음
    }

    @Override
    public List<ChatMessage> getMessages(long roomId, Long beforeId, int size) {
        int limit = Math.max(1, Math.min(size, 200));
        var page = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        var docs = messageRepo
            .findByChatroomIdOrderByCreatedAtDesc(roomId, page)
            .getContent();
        return docs;
    }

    /** 세션 연결 시 호출: 최초 0->1이면 true 반환(브로드캐스트 필요) */
    public boolean markOnline(String userId, String sessionId) {
        sessionToUser.put(sessionId, userId);
        int after = onlineCount.merge(userId, 1, Integer::sum);
        return after == 1;
    }

    /** 세션 해제 시 호출: 1->0이 되면 true 반환 */
    public boolean decrement(String userId, String sessionId) {
        sessionToUser.remove(sessionId);
        return onlineCount.compute(userId, (k, v) -> {
            if (v == null) return null;
            int n = v - 1;
            return n <= 0 ? null : n;
        }) == null;
    }

    /** 강제 OFF (로그아웃 버튼/수동 호출용) */
    public boolean forceOffline(String userId) {
        boolean wasOnline = onlineCount.remove(userId) != null;
        // 해당 유저의 세션 키들도 정리(선택)
        sessionToUser.entrySet().removeIf(e -> userId.equals(e.getValue()));
        return wasOnline;
    }

    public String resolveUserBySession(String sessionId) {
        return sessionToUser.get(sessionId);
    }

    /** 초기 동기화용 */
    public List<String> getOnlineUserIds() {
        return onlineCount.entrySet().stream()
                .filter(e -> e.getValue() != null && e.getValue() > 0)
                .map(Map.Entry::getKey)
                .toList();
    }

    // ✅ 추가: 신고된 메시지 기준 앞뒤 대화 조회용
    public List<ChatMessage> getContextMessages(String messageId, int beforeCount, int afterCount) {
        ChatMessage center = messageRepo.findById(messageId)
                .orElseThrow(() -> new RuntimeException("해당 메시지를 찾을 수 없습니다."));

        Instant timestamp = center.getCreatedAt();
        long roomId = center.getChatroomId();

        var beforePage = PageRequest.of(0, beforeCount, Sort.by(Sort.Direction.DESC, "createdAt"));
        var afterPage = PageRequest.of(0, afterCount, Sort.by(Sort.Direction.ASC, "createdAt"));

        List<ChatMessage> before = messageRepo
                .findByChatroomIdAndCreatedAtLessThanOrderByCreatedAtDesc(roomId, timestamp, beforePage)
                .getContent();
        Collections.reverse(before);

        List<ChatMessage> after = messageRepo
                .findByChatroomIdAndCreatedAtGreaterThanOrderByCreatedAtAsc(roomId, timestamp, afterPage)
                .getContent();

        List<ChatMessage> all = new ArrayList<>();
        all.addAll(before);
        all.add(center);
        all.addAll(after);

        return all;
    }
}
