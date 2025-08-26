package com.example.service;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.example.VO.ChatMessage;
import com.example.VO.ChatRoom;
import com.mongodb.lang.Nullable;

public interface RtChatService {
    public ChatRoom createRoomIfAbsent(long a, long b, String field);
    public ChatMessage send(long roomId, long senderId, String content, @Nullable String clientMsgId); 
    public List<ChatMessage> getMessages(long roomId, Long beforeId, int size);
    /** 세션 연결 시 호출: 최초 0->1이면 true 반환(브로드캐스트 필요) */
    public boolean markOnline(String userId, String sessionId); 
    /** 세션 해제 시 호출: 1->0이 되면 true 반환 */
    public boolean decrement(String userId, String sessionId); 
    /** 강제 OFF (로그아웃 버튼/수동 호출용) */
    public boolean forceOffline(String userId); 
    public String resolveUserBySession(String sessionId); 
    /** 초기 동기화용 */
    public List<String> getOnlineUserIds();
    public List<ChatMessage> getContextMessagesAroundReportedMessage(int reportId, int minutesBefore, int minutesAfter);
    List<Long> getParticipants(long roomId);
    String resolveLoginId(Long userId);
    //public ChatMessage saveMessage(long roomId, long senderId, String content);
    //public List<ChatMessage> getMessages(long roomId, Long beforeId, int limit);
}