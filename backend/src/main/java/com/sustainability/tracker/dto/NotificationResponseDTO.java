package com.sustainability.tracker.dto;

import com.sustainability.tracker.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {
    private Long id;
    private String notificationType;
    private String title;
    private String message;
    private Boolean isRead;
    private String priority;
    private String relatedEntityType;
    private Long relatedEntityId;
    private String actionUrl;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

    public static NotificationResponseDTO from(Notification notification) {
        return new NotificationResponseDTO(
                notification.getId(),
                notification.getNotificationType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getIsRead(),
                notification.getPriority(),
                notification.getRelatedEntityType(),
                notification.getRelatedEntityId(),
                notification.getActionUrl(),
                notification.getCreatedAt(),
                notification.getReadAt()
        );
    }
}
