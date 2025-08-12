package com.example.service;
import java.util.List;
import com.example.VO.ChatMessage;
import com.example.VO.ChatRoom;

public interface RtChatService {
    public ChatRoom createRoomIfAbsent(long a, long b, String field);
    public ChatMessage saveMessage(long roomId, long senderId, String content);
    public List<ChatMessage> getMessages(long roomId, Long beforeId, int limit);
}
