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

       // ✅ 안 읽은 알림 개수
    public long getUnreadCount() {
        // TODO: userId는 로그인 유저에서 가져오거나 고정값을 넣어야 함
        int userId = 1; 
        return repo.countUnreadNotifications(userId);
    }

    // ✅ 최신 알림 목록 (size 제한)
    public List<NotificationVO> getLatest(int size) {
        int userId = 1; 
        List<NotificationVO> list = repo.getNotificationsByUser(userId);
        return list.size() > size ? list.subList(0, size) : list;
    }

    // ✅ 특정 알림 읽음 처리
    public void markAsRead(Long notificationId) {
        repo.markAsRead(notificationId.intValue());
    }

    // ✅ 전체 알림 읽음 처리
    public void markAllAsRead() {
        int userId = 1; 
        repo.markAllAsRead(userId);
    }
}
