package com.example.VO;
import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document("chat_messages")
@CompoundIndex(name="room_created_idx", def="{ 'chatroomId': 1, 'createdAt': 1 }")
public class ChatMessage {	
		//private Long messageId;
	@Id private String id;
	    private long chatroomId;
	    private long senderId;
	    private String content;
	    //private LocalDateTime timestamp;
	    @com.fasterxml.jackson.annotation.JsonProperty("timestamp")
	    private Instant createdAt;
	    @com.fasterxml.jackson.annotation.JsonProperty("isRead")
	    private Boolean isRead;		
}
