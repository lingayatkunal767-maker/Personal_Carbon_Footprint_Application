package com.carbon.carbon.controller;

import com.carbon.carbon.dto.NotificationDTO;
import com.carbon.carbon.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(@RequestParam(required = false, defaultValue = "1") Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestParam(required = false, defaultValue = "1") Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @DeleteMapping("/read")
    public ResponseEntity<?> clearReadNotifications(@RequestParam(required = false, defaultValue = "1") Long userId) {
        notificationService.clearReadNotifications(userId);
        return ResponseEntity.ok(Map.of("message", "Read notifications cleared"));
    }
}
