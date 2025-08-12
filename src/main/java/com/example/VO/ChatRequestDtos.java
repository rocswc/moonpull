package com.example.VO;
import java.time.Instant;
import java.util.List;
import com.example.VO.MemberVO;
import com.example.VO.ChatRoom;
import com.example.VO.ChatMessage;

public class ChatRequestDtos {
	  public record CreateRequest(Long toUserId) {}

	  public record RequestPushed(
	      String requestId, Long fromUserId, Long toUserId, Instant createdAt,
	      MemberVO fromUser, MemberVO toUser) {}

	  public record AcceptRequest(String requestId, Long fromUserId, Long toUserId) {}

	  public record RoomOpened(String requestId, ChatRoom chatroom,
	                           List<MemberVO> participants, List<ChatMessage> messages) {}
}
