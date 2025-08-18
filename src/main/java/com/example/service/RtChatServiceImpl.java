package com.example.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.DAO.ChatMessageDocRepo;
import com.example.DAO.ChatMessageRepository2;
import com.example.DAO.ChatRoomRepository;
import com.example.VO.ChatMessage;
import com.example.VO.ChatRoom;
import com.mongodb.lang.Nullable;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

@Service 
@RequiredArgsConstructor
public class RtChatServiceImpl implements RtChatService {

    private final ChatRoomRepository roomRepository;
    private final ChatMessageDocRepo messageRepo;
    private final MongoTemplate mongoTemplate;
    //private final ChatMessageRepository2 msgRepository;

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
      
      // (선택) RDB의 last_message / last_message_at 갱신 로직이 있다면 여기서 수행
      // chatRoomRepository.updateLastMessage(roomId, content, Timestamp.from(saved.getCreatedAt()));
      return saved; // saved.getId()에 Mongo가 만든 _id 문자열이 들어있음
    }

      
//    public List<ChatMessage> list(long roomId, int limit) {
//        return messageRepo
//        	      .findByChatroomIdOrderByCreatedAtDesc(roomId, PageRequest.of(0, limit))
//        	      .getContent();
//    }
    
    
    @Override
    public List<ChatMessage> getMessages(long roomId, Long beforeId, int size) {
        int limit = Math.max(1, Math.min(size, 200));
        var page = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        var docs = messageRepo
            .findByChatroomIdOrderByCreatedAtDesc(roomId, page)
            .getContent(); // ← 이미 구현돼 있음 :contentReference[oaicite:2]{index=2}
        // 프론트는 오래→최신으로 쓰므로(정렬 로직도 있지만) 원하면 역정렬해도 됨
        // Collections.reverse(docs);
        return docs;
    }
    
    
    
    
    
    
    
    
    
    
//    @Transactional
//    public ChatMessage saveMessage(long roomId, long senderId, String content) {
//        ChatMessage m = new ChatMessage();
//        m.setChatroomId((int) roomId);
//        m.setSenderId((int) senderId);
//        m.setContent(content);
//        msgRepository.insert(m);
//        return m;
//    }
//
//    public List<ChatMessage> getMessages(long roomId, Long beforeId, int limit) {
//        return msgRepository.findByRoomPaged(roomId, beforeId, limit);
//    }
		
}