package com.example.DAO;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.bson.types.ObjectId;
import com.example.VO.ChatMessage;

import java.time.Instant;
import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ChatMessageDocRepo extends MongoRepository<ChatMessage, Object> {
	  Page<ChatMessage> findByChatroomIdOrderByCreatedAtDesc(long roomId, Pageable pageable);
	  Page<ChatMessage> findByChatroomIdAndCreatedAtLessThanOrderByCreatedAtDesc(long roomId, Instant before, Pageable pageable);
	  Page<ChatMessage> findByChatroomIdAndCreatedAtGreaterThanOrderByCreatedAtAsc(long roomId, Instant createdAt, Pageable pageable);
	  List<ChatMessage> findByChatroomIdAndCreatedAtBetweenOrderByCreatedAtAsc(
		        long chatroomId,
		        Date from,
		        Date to
		    );


	  ChatMessage findByChatMessageId(String mongoMessageId);  

}