package com.example.DAO;

import java.util.List;
import com.example.VO.NotificationVO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface NotificationRepository {

    void insertNotification(NotificationVO notification);

    List<NotificationVO> getNotificationsByUser(int userId);

    int countUnreadNotifications(int userId);

    void markAsRead(int notificationId);

    void markAllAsRead(int userId);
}
