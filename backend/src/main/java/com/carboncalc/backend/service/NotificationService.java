package com.carboncalc.backend.service;

import com.carboncalc.backend.dto.NotificationResponse;
import com.carboncalc.backend.entity.Notification;
import com.carboncalc.backend.entity.User;
import com.carboncalc.backend.repository.NotificationRepository;
import com.carboncalc.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toDto).toList();
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        n.setIsRead(true);
        return toDto(notificationRepository.save(n));
    }

    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        notificationRepository.delete(n);
    }

    /** Internal helper — called by other services to push a notification */
    @Transactional
    public void push(Long userId, String title, String message, String type) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;
        Notification n = Notification.builder()
            .user(user).title(title).message(message)
            .type(type).isRead(false).createdAt(LocalDateTime.now())
            .build();
        notificationRepository.save(n);
    }

    private NotificationResponse toDto(Notification n) {
        return NotificationResponse.builder()
            .id(n.getId()).title(n.getTitle()).message(n.getMessage())
            .type(n.getType()).isRead(n.getIsRead()).createdAt(n.getCreatedAt())
            .build();
    }
}
