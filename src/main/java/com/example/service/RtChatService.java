package com.example.service;
import java.time.Instant;
import java.util.List;
import com.example.VO.ChatMessage;
import com.example.VO.ChatRoom;
import com.mongodb.lang.Nullable;

public interface RtChatService {
    public ChatRoom createRoomIfAbsent(long a, long b, String field);
    public ChatMessage send(long roomId, long senderId, String content, @Nullable String clientMsgId); 
    public List<ChatMessage> getMessages(long roomId, Long beforeId, int size);
    //public ChatMessage saveMessage(long roomId, long senderId, String content);
    //public List<ChatMessage> getMessages(long roomId, Long beforeId, int limit);
}