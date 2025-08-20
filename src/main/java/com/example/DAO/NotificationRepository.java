package com.example.DAO;

import java.util.List;
import com.example.VO.NotificationVO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface NotificationRepository {

    void insertNotification(NotificationVO notification);

    List<NotificationVO> getNotificationsByUser(Integer userId);

    int countUnreadNotifications(Integer userId);

    void markAsRead(Integer notificationId);

    void markAllAsRead(Integer userId);
}
