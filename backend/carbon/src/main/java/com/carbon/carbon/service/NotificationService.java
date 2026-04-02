package com.carbon.carbon.service;

import com.carbon.carbon.dto.NotificationDTO;
import com.carbon.carbon.entity.Notification;
import com.carbon.carbon.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<NotificationDTO> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : notifications) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
    }
    
    @Transactional
    public void clearReadNotifications(Long userId) {
        notificationRepository.deleteByUserIdAndIsReadTrue(userId);
    }

    @Transactional
    public void createNotification(Long userId, String message, String category) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setMessage(message);
        notification.setCategory(category);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    private NotificationDTO convertToDTO(Notification notif) {
        return new NotificationDTO(
                notif.getId(),
                notif.getMessage(),
                notif.getCategory(),
                notif.getIsRead(),
                notif.getCreatedAt()
        );
    }
}
