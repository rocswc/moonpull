package com.example.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.DAO.ChatMessageRepository2;
import com.example.DAO.ChatRoomRepository;
import com.example.VO.ChatMessage;
import com.example.VO.ChatRoom;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor
public class RtChatServiceImpl implements RtChatService {

    private final ChatRoomRepository roomRepository;
    private final ChatMessageRepository2 msgRepository;

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

    @Transactional
    public ChatMessage saveMessage(long roomId, long senderId, String content) {
        ChatMessage m = new ChatMessage();
        m.setChatroomId((int) roomId);
        m.setSenderId((int) senderId);
        m.setContent(content);
        msgRepository.insert(m);
        return m;
    }

    public List<ChatMessage> getMessages(long roomId, Long beforeId, int limit) {
        return msgRepository.findByRoomPaged(roomId, beforeId, limit);
    }
	
		
}
