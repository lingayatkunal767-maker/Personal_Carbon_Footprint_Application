package com.carboncalc.app.service.notification;

import com.carboncalc.app.dto.notification.MarkReadResponse;
import com.carboncalc.app.dto.notification.NotificationResponse;
import com.carboncalc.app.entity.Notification;
import com.carboncalc.app.entity.User;
import com.carboncalc.app.enums.NotificationType;
import com.carboncalc.app.repository.NotificationRepository;
import com.carboncalc.app.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public List<NotificationResponse> getNotifications(Long userId) {
        User user = userService.getUserEntity(userId);

        return notificationRepository.findByUser(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public MarkReadResponse markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setIsRead(true);
        notificationRepository.save(notification);

        return MarkReadResponse.builder()
                .message("Notification marked as read")
                .build();
    }

    public void createGeneralNotification(User user, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .type(NotificationType.GENERAL)
                .message(message)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}