package com.example.DAO;

import com.example.VO.ChatRoom;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ChatRoomRepository {
    ChatRoom findById(@Param("id") long id);

    ChatRoom findByPair(@Param("uMin") long uMin, @Param("uMax") long uMax);

    int insert(ChatRoom room);

    List<ChatRoom> findRoomsOf(@Param("userId") long userId);
}