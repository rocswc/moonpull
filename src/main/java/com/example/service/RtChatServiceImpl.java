package com.example.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.bson.types.ObjectId;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.DAO.ChatMessageDocRepo;
import com.example.DAO.ChatRoomRepository;
import com.example.DAO.MemberRepository;
import com.example.DAO.ReportRepository;
import com.example.VO.ChatMessage;
import com.example.VO.ChatRoom;
import com.example.VO.ReportVO;
import com.example.entity.Member;
import com.mongodb.lang.Nullable;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service 
@RequiredArgsConstructor
@Slf4j
public class RtChatServiceImpl implements RtChatService {

    private final ChatRoomRepository roomRepository;
    private final ChatMessageDocRepo messageRepo;
    private final MongoTemplate mongoTemplate;
    private final ReportRepository reportRepository;
    private final MemberRepository memberRepository;

    private final ConcurrentMap<String, Integer> onlineCount = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, String> sessionToUser = new ConcurrentHashMap<>();

    @Transactional
    public ChatRoom createRoomIfAbsent(long a, long b, String field) {
        long uMin = Math.min(a, b);
        long uMax = Math.max(a, b);
        log.info("🛠️ [채팅방 확인] uMin={}, uMax={}, field={}", uMin, uMax, field);
        ChatRoom found = roomRepository.findByPair(uMin, uMax);
        if (found != null) {
            log.info("✅ [기존 채팅방 존재] roomId={}", found.getChatroomId());
            return found;
        }

        ChatRoom room = new ChatRoom();
        room.setParticipant1_Id(uMin);
        room.setParticipant2_Id(uMax);
        room.setField(field);

        try {
            roomRepository.insert(room);
            log.info("✅ [채팅방 생성 성공] roomId={}", room.getChatroomId());
            return room;
        } catch (Exception e) {
            log.error("❌ 채팅방 생성 실패: uMin={}, uMax={}, error={}", uMin, uMax, e.getMessage());
            throw new RuntimeException("채팅방 생성 중 오류 발생");
        }
    }

    public ChatMessage send(long roomId, long senderId, String content, @Nullable String clientMsgId) {
        if (roomId <= 0 || senderId <= 0 || content == null || content.isBlank()) {
            log.warn("⚠️ [잘못된 전송 파라미터] roomId={}, senderId={}, content={}", roomId, senderId, content);
            throw new IllegalArgumentException("유효하지 않은 파라미터");
        }

        ChatMessage doc = new ChatMessage();
        doc.setChatroomId(roomId);
        doc.setSenderId(senderId);
        doc.setContent(content);
        doc.setCreatedAt(Instant.now());
        doc.setIsRead(false);

        log.info("💬 [메시지 저장 시도] roomId={}, senderId={}, content={}", roomId, senderId, content);

        try {
            ChatMessage saved = messageRepo.save(doc);
            log.info("✅ [메시지 저장 성공] id={}, mongoId={}, time={}", saved.getChatMessageId(), saved.getId(), saved.getCreatedAt());
            return saved;
        } catch (Exception e) {
            log.error("❌ 메시지 저장 실패: roomId={}, senderId={}, error={}", roomId, senderId, e.getMessage());
            throw new RuntimeException("메시지 저장 중 오류 발생");
        }
    }

    @Override
    public List<ChatMessage> getMessages(long roomId, Long beforeId, int size) {
        int limit = Math.max(1, Math.min(size, 200));
        var page = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        log.info("📜 [이전 메시지 조회] roomId={}, beforeId={}, limit={}", roomId, beforeId, limit);
        return messageRepo.findByChatroomIdOrderByCreatedAtDesc(roomId, page).getContent();
    }

    public boolean markOnline(String userId, String sessionId) {
        sessionToUser.put(sessionId, userId);
        int after = onlineCount.merge(userId, 1, Integer::sum);
        log.info("🔵 [온라인 처리] userId={}, sessionId={}, 접속 수={}", userId, sessionId, after);
        return after == 1;
    }

    public boolean decrement(String userId, String sessionId) {
        sessionToUser.remove(sessionId);
        boolean offline = onlineCount.compute(userId, (k, v) -> {
            if (v == null) return null;
            int n = v - 1;
            return n <= 0 ? null : n;
        }) == null;
        log.info("🔴 [오프라인 처리] userId={}, sessionId={}, 완전 오프라인={}", userId, sessionId, offline);
        return offline;
    }

    public boolean forceOffline(String userId) {
        boolean wasOnline = onlineCount.remove(userId) != null;
        sessionToUser.entrySet().removeIf(e -> userId.equals(e.getValue()));
        log.warn("⚠️ [강제 오프라인] userId={}, wasOnline={}", userId, wasOnline);
        return wasOnline;
    }

    public String resolveUserBySession(String sessionId) {
        String userId = sessionToUser.get(sessionId);
        log.debug("🔎 [세션→사용자] sessionId={}, userId={}", sessionId, userId);
        return userId;
    }

    public List<String> getOnlineUserIds() {
        List<String> onlineUsers = onlineCount.entrySet().stream()
                .filter(e -> e.getValue() != null && e.getValue() > 0)
                .map(Map.Entry::getKey)
                .toList();
        log.info("📶 [온라인 사용자 목록] {}명", onlineUsers.size());
        return onlineUsers;
    }

    @Override
    public List<ChatMessage> getContextMessagesAroundReportedMessage(int reportId, int minutesBefore, int minutesAfter) {
        ReportVO report = reportRepository.getReportById(reportId);
        log.info("📋 [Context 조회 시작] reportId={}, before={}분, after={}분", reportId, minutesBefore, minutesAfter);
        String mongoMessageId = report.getChatMessageMongoId();

        if (mongoMessageId == null || mongoMessageId.isBlank()) {
            log.warn("[Context] ❌ Mongo 메시지 ID 없음: reportId={}", reportId);
            return Collections.emptyList();
        }

        ChatMessage centerMessage;
        try {
            centerMessage = mongoTemplate.findById(new ObjectId(mongoMessageId), ChatMessage.class);
        } catch (IllegalArgumentException e) {
            log.warn("[Context] ❌ 잘못된 ObjectId 형식: {}", mongoMessageId);
            return Collections.emptyList();
        }

        if (centerMessage == null) {
            log.warn("[Context] ❌ 기준 메시지 없음: mongoMessageId={}", mongoMessageId);
            return Collections.emptyList();
        }

        if (centerMessage.getChatroomId() == 0L || centerMessage.getCreatedAt() == null) {
            log.warn("[Context] ❌ 기준 메시지 정보 부족");
            return Collections.emptyList();
        }

        Instant center = centerMessage.getCreatedAt();
        Instant start = center.minus(minutesBefore, ChronoUnit.MINUTES);
        Instant end = center.plus(minutesAfter, ChronoUnit.MINUTES);
        Date fromTime = Date.from(start);
        Date toTime = Date.from(end);

        List<ChatMessage> contextMessages = messageRepo.findByChatroomIdAndCreatedAtBetweenOrderByCreatedAtAsc(
                centerMessage.getChatroomId(), fromTime, toTime);

        if (contextMessages.stream().noneMatch(m -> m.getId().equals(centerMessage.getId()))) {
            contextMessages.add(0, centerMessage);
        }

        log.info("[Context] ✅ 문맥 메시지 개수: {}", contextMessages.size());
        return contextMessages;
    }

    public List<Long> getParticipants(long roomId) {
        ChatRoom room = roomRepository.findById(roomId);
        if (room == null) {
            log.error("❌ 채팅방 없음: roomId={}", roomId);
            throw new RuntimeException("채팅방이 존재하지 않음");
        }
        log.info("👥 [채팅방 참가자] roomId={}, participants=[{}, {}]", roomId, room.getParticipant1_Id(), room.getParticipant2_Id());
        return List.of(room.getParticipant1_Id(), room.getParticipant2_Id());
    }

    @Override
    public String resolveLoginId(Long userId) {
        return memberRepository.findById(userId)
                .map(Member::getLoginId)
                .orElseThrow(() -> {
                    log.error("❌ 로그인 ID 조회 실패: userId={}", userId);
                    return new RuntimeException("해당 사용자를 찾을 수 없습니다: " + userId);
                });
    }
}
