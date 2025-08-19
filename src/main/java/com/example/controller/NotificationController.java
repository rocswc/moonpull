package com.example.controller;

import com.example.VO.NotificationVO;

import com.example.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;

    // 안 읽은 알림 개수
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        return ResponseEntity.ok(service.getUnreadCount());
    }

    // 알림 목록 조회 (최신순, size 제한)
    @GetMapping
    public ResponseEntity<List<NotificationVO>> getNotifications(@RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getLatest(size));
    }

    // 특정 알림 읽음 처리
    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        service.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    // 전체 알림 읽음 처리
    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        service.markAllAsRead();
        return ResponseEntity.ok().build();
    }
}
