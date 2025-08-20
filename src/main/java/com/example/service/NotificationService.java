package com.example.service;

import com.example.DAO.NotificationRepository;
import com.example.VO.NotificationVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {


    private final NotificationRepository repo;

    public void insertNotification(NotificationVO vo) {
        repo.insertNotification(vo);
    }

    public long getUnreadCount(Integer userId) {
        return repo.countUnreadNotifications(userId);
    }

    public List<NotificationVO> getLatest(Integer userId, int size) {
        List<NotificationVO> list = repo.getNotificationsByUser(userId);
        return list.size() > size ? list.subList(0, size) : list;
    }

    public void markAsRead(Integer notificationId) {
        repo.markAsRead(notificationId.intValue());
    }

    public void markAllAsRead(Integer userId) {
        repo.markAllAsRead(userId);
    }
}
