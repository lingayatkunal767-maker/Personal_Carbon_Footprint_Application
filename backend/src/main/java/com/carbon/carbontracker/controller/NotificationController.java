
package com.carbon.carbontracker.controller;

import com.carbon.carbontracker.service.NotificationService;
import com.carbon.carbontracker.dto.NotificationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.carbon.carbontracker.model.Notification;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    // USER: Get notifications
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    // USER: Mark as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    // ADMIN: Create notification
    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody NotificationDTO dto) {
        Notification n = notificationService.createNotification(
            dto.getUserId(), dto.getTitle(), dto.getMessage(), dto.getType()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(n);
    }

    // ADMIN: Edit notification
    @PutMapping("/{id}")
    public ResponseEntity<Notification> updateNotification(@PathVariable Long id, @RequestBody NotificationDTO dto) {
        return ResponseEntity.ok(notificationService.updateNotification(id, dto.getTitle(), dto.getMessage()));
    }

    // ADMIN: Delete notification
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    // ADMIN: Get all notifications
    @GetMapping("/admin/all")
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }
}