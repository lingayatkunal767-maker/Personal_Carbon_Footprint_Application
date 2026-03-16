package com.carboncalc.app.controller;

import com.carboncalc.app.dto.common.ApiResponse;
import com.carboncalc.app.dto.notification.MarkReadResponse;
import com.carboncalc.app.dto.notification.NotificationResponse;
import com.carboncalc.app.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{userId}")
    public ApiResponse<List<NotificationResponse>> getNotifications(@PathVariable Long userId) {
        return ApiResponse.<List<NotificationResponse>>builder()
                .success(true)
                .message("Notifications fetched successfully")
                .data(notificationService.getNotifications(userId))
                .build();
    }

    @PutMapping("/{notificationId}/read")
    public ApiResponse<MarkReadResponse> markAsRead(@PathVariable Long notificationId) {
        return ApiResponse.<MarkReadResponse>builder()
                .success(true)
                .message("Notification marked as read")
                .data(notificationService.markAsRead(notificationId))
                .build();
    }
}