package com.example.DAO;

import com.example.VO.ChatMessage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ChatMessageRepository2 {
    int insert(ChatMessage msg);
    List<ChatMessage> findByRoomPaged(@Param("roomId") long roomId,
                                      @Param("beforeId") Long beforeId,
                                      @Param("limit") int limit);
}