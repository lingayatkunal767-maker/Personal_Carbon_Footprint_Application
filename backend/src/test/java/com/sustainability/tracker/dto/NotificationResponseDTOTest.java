package com.sustainability.tracker.dto;

import com.sustainability.tracker.entity.Notification;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class NotificationResponseDTOTest {

    @Test
    void fromNormalizesLegacyMarketplaceTitle() {
        Notification notification = new Notification();
        notification.setId(100L);
        notification.setNotificationType("MARKETPLACE");
        notification.setTitle("â Order Cancelled");
        notification.setMessage("Your order ORD-1 has been cancelled successfully.");
        notification.setIsRead(false);
        notification.setPriority("HIGH");

        NotificationResponseDTO dto = NotificationResponseDTO.from(notification);

        assertEquals("Order Cancelled", dto.getTitle());
        assertEquals("Your order ORD-1 has been cancelled successfully.", dto.getMessage());
    }

    @Test
    void fromFallsBackForBlankTitle() {
        Notification notification = new Notification();
        notification.setId(101L);
        notification.setNotificationType("REMINDER");
        notification.setTitle(" ");
        notification.setMessage("Please log your activity today.");
        notification.setIsRead(false);
        notification.setPriority("LOW");

        NotificationResponseDTO dto = NotificationResponseDTO.from(notification);

        assertEquals("Notification", dto.getTitle());
    }

    @Test
    void fromNormalizesBadgeAssignedAndEarnedTitlesToSingleLabel() {
        Notification assigned = new Notification();
        assigned.setId(102L);
        assigned.setNotificationType("BADGE_EARNED");
        assigned.setTitle("🏅 New Badge Assigned");
        assigned.setMessage("Admin assigned badge");
        assigned.setIsRead(false);
        assigned.setPriority("HIGH");

        Notification earned = new Notification();
        earned.setId(103L);
        earned.setNotificationType("BADGE_EARNED");
        earned.setTitle("🏆 New Badge Earned!");
        earned.setMessage("System awarded badge");
        earned.setIsRead(false);
        earned.setPriority("HIGH");

        assertEquals("Badge Earned", NotificationResponseDTO.from(assigned).getTitle());
        assertEquals("Badge Earned", NotificationResponseDTO.from(earned).getTitle());
    }

    @Test
    void fromNormalizesMessageSpacingCapitalizationAndPunctuation() {
        Notification notification = new Notification();
        notification.setId(104L);
        notification.setNotificationType("REMINDER");
        notification.setTitle("reminder");
        notification.setMessage("  please   log your activity today  ");
        notification.setIsRead(false);
        notification.setPriority("LOW");

        NotificationResponseDTO dto = NotificationResponseDTO.from(notification);

        assertEquals("Please log your activity today.", dto.getMessage());

        notification.setMessage("great progress! admin assigned badge verification Reason: qa flow 🌍.");
        dto = NotificationResponseDTO.from(notification);
        assertEquals("Great progress! admin assigned badge verification. Reason: qa flow. 🌍", dto.getMessage());

        notification.setMessage("planet thanks you!.. 🌍");
        dto = NotificationResponseDTO.from(notification);
        assertEquals("Planet thanks you! 🌍", dto.getMessage());
    }
}
