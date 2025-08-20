package com.example.controller;

import com.example.VO.NotificationVO;
import com.example.security.CustomUserDetails;
import com.example.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;

    // 안 읽은 알림 개수
    @GetMapping("/unread-count") 
    public long getUnreadCount(@AuthenticationPrincipal CustomUserDetails user) {
        return service.getUnreadCount(user.getUserId());
    }

    // ✅ 최신 알림 목록
    @GetMapping
    public List<NotificationVO> getLatest(
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails user) {
        return service.getLatest(user.getUserId(), size);
    }

    // ✅ 특정 알림 읽음 처리
    @PostMapping("/{id}/read")
    public void markAsRead(@PathVariable Integer id) {
        service.markAsRead(id);
    }

    // ✅ 전체 알림 읽음 처리
    @PostMapping("/read-all")
    public void markAllAsRead(@AuthenticationPrincipal CustomUserDetails user) {
        service.markAllAsRead(user.getUserId());
    }
}
