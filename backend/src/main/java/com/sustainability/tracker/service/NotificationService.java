package com.sustainability.tracker.service;

import com.sustainability.tracker.entity.Notification;
import com.sustainability.tracker.entity.User;
import com.sustainability.tracker.repository.NotificationRepository;
import com.sustainability.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

/**
 * Notification Service
 * Manages user notifications and alerts
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Get all notifications for a user
     */
    public List<Notification> getUserNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return normalizeLegacyNotificationText(notifications);
    }

    /**
     * Get unread notifications for a user
     */
    public List<Notification> getUnreadNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        return normalizeLegacyNotificationText(notifications);
    }

    /**
     * Get count of unread notifications
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    /**
     * Mark notification as read
     */
    public void markAsRead(Long notificationId) {
        Long safeNotificationId = Objects.requireNonNull(notificationId, "notificationId is required");
        Notification notification = notificationRepository.findById(safeNotificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.markAsRead();
        notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(Long userId) {
        Long safeUserId = Objects.requireNonNull(userId, "userId is required");
        notificationRepository.markAllAsReadByUserId(safeUserId);
    }

    /**
     * Create a notification
     */
    public Notification createNotification(Long userId, String type, String title, String message, 
                                           String priority, String relatedEntityType, Long relatedEntityId) {
        Long safeUserId = Objects.requireNonNull(userId, "userId is required");
        User user = userRepository.findById(safeUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setNotificationType(type);
        notification.setTitle(normalizeTitle(type, title));
        notification.setMessage(normalizeMessage(message));
        notification.setPriority(priority);
        notification.setRelatedEntityType(relatedEntityType);
        notification.setRelatedEntityId(relatedEntityId);

        log.info("📬 Created notification for user {}: {}", userId, title);
        return notificationRepository.save(notification);
    }

    /**
     * Create badge earned notification
     */
    public void notifyBadgeEarned(Long userId, String badgeName, String description) {
        createNotification(
                userId,
                "BADGE_EARNED",
                "🏆 New Badge Earned!",
                "Congratulations! You've earned the '" + badgeName + "' badge. " + description,
                "HIGH",
                "Badge",
                null
        );
    }

    /**
     * Create notification when admin assigns a badge.
     */
    public void notifyBadgeAssignedByAdmin(Long userId,
                                           String badgeName,
                                           String description,
                                           String reason,
                                           Long assignmentId) {
        StringBuilder messageBuilder = new StringBuilder()
                .append("Great progress! Admin assigned you the '")
                .append(badgeName)
                .append("' badge.");

        if (description != null && !description.isBlank()) {
            messageBuilder.append(' ').append(description.trim());
        }

        if (reason != null && !reason.isBlank()) {
            if (!messageBuilder.toString().matches(".*[.!?]\\s*$")) {
                messageBuilder.append('.');
            }
            messageBuilder.append(" Reason: ").append(reason.trim());
        }

        createNotification(
                userId,
                "BADGE_EARNED",
                "🏅 New Badge Assigned",
                messageBuilder.toString(),
                "HIGH",
                "BadgeAssignment",
                assignmentId
        );
    }

    /**
     * Create goal progress notification
     */
    public void notifyGoalProgress(Long userId, String goalType, int progressPercentage, Long goalId) {
        String message = String.format("You're making great progress! Your '%s' goal is %d%% complete.", 
                goalType, progressPercentage);
        
        createNotification(
                userId,
                "GOAL_PROGRESS",
                "🎯 Goal Progress Update",
                message,
                "NORMAL",
                "Goal",
                goalId
        );
    }

    /**
     * Create goal completed notification
     */
    public void notifyGoalCompleted(Long userId, String goalType, Long goalId) {
        createNotification(
                userId,
                "GOAL_COMPLETED",
                "🎉 Goal Completed!",
                "Amazing! You've completed your '" + goalType + "' goal. Keep up the great work!",
                "HIGH",
                "Goal",
                goalId
        );
    }

    /**
     * Create high emissions warning
     */
    public void notifyHighEmissions(Long userId, String category, double emissionValue) {
        String message = String.format("Your %s emissions (%.2f kg CO2e) are higher than usual. " +
                "Consider reviewing your activities to reduce your carbon footprint.", category, emissionValue);
        
        createNotification(
                userId,
                "HIGH_EMISSIONS",
                "⚠️ High Emissions Alert",
                message,
                "URGENT",
                "CarbonLog",
                null
        );
    }

    /**
     * Create reminder notification
     */
    public void notifyReminder(Long userId, String reminderMessage) {
        createNotification(
                userId,
                "REMINDER",
                "💡 Friendly Reminder",
                reminderMessage,
                "LOW",
                null,
                null
        );
    }

    /**
     * Create order confirmation notification
     */
    public void notifyOrderConfirmed(Long userId, String orderNumber, Long orderId) {
        String message = String.format("Your order %s has been confirmed and will be shipped soon!", orderNumber);
        
        createNotification(
                userId,
                "MARKETPLACE",
                "📦 Order Confirmed",
                message,
                "HIGH",
                "Order",
                orderId
        );
    }

    /**
     * Create order cancellation notification
     */
    public void notifyOrderCancelled(Long userId, String orderNumber, Long orderId) {
        String message = String.format("Your order %s has been cancelled successfully.", orderNumber);

        createNotification(
                userId,
                "MARKETPLACE",
                "❌ Order Cancelled",
                message,
                "HIGH",
                "Order",
                orderId
        );
    }

    private List<Notification> normalizeLegacyNotificationText(List<Notification> notifications) {
        boolean changed = false;

        for (Notification notification : notifications) {
            String normalizedTitle = normalizeTitle(notification.getNotificationType(), notification.getTitle());
            String normalizedMessage = normalizeMessage(notification.getMessage());

            if (!Objects.equals(notification.getTitle(), normalizedTitle)) {
                notification.setTitle(normalizedTitle);
                changed = true;
            }
            if (!Objects.equals(notification.getMessage(), normalizedMessage)) {
                notification.setMessage(normalizedMessage);
                changed = true;
            }
        }

        if (changed) {
            notificationRepository.saveAll(notifications);
        }

        return notifications;
    }

    private String normalizeTitle(String notificationType, String title) {
        String safeTitle = normalizeText(title);
        String lower = safeTitle.toLowerCase();

        if ("BADGE_EARNED".equalsIgnoreCase(notificationType)
                && (lower.contains("badge earned") || lower.contains("badge assigned"))) {
            return "Badge Earned";
        }
        if ("MARKETPLACE".equalsIgnoreCase(notificationType) && lower.contains("order cancelled")) {
            return "Order Cancelled";
        }
        if ("MARKETPLACE".equalsIgnoreCase(notificationType) && lower.contains("order confirmed")) {
            return "Order Confirmed";
        }

        return safeTitle.isBlank() ? "Notification" : safeTitle;
    }

    private String normalizeMessage(String message) {
        String safeMessage = normalizeText(message);
        if (safeMessage.isBlank()) {
            return "Notification update.";
        }

        String normalized = safeMessage
                .replaceAll("\\s+", " ")
                .replaceAll("\\s+([,.;:!?])", "$1")
                .replaceAll("([^.!?])\\s+Reason:", "$1. Reason:")
            .replaceAll("([.!?])[.!?]+", "$1")
                .trim();

        normalized = capitalizeLeadingLetter(normalized);
        normalized = movePeriodBeforeTrailingEmoji(normalized);

        if (normalized.matches(".*\\p{So}$") && !normalized.matches(".*[.!?]\\s*\\p{So}$")) {
            normalized = normalized.replaceAll("(\\p{So})$", ". $1");
        }

        normalized = normalized
                .replaceAll("\\s+([,.;:!?])", "$1")
            .replaceAll("([.!?])[.!?]+", "$1")
                .replaceAll("([.!?])([\\p{So}])$", "$1 $2");

        if (!normalized.matches(".*[.!?]$") && !normalized.matches(".*\\p{So}$")) {
            normalized = normalized + ".";
        }

        return normalized;
    }

    private String normalizeText(String value) {
        if (value == null) {
            return "";
        }

        String normalized = value
                .replace("\u00A0", " ")
                .replace("\u009D", "")
                .replace("\u008C", "")
                .trim();

        return normalized;
    }

    private String capitalizeLeadingLetter(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }

        char[] chars = text.toCharArray();
        for (int i = 0; i < chars.length; i++) {
            if (Character.isLetter(chars[i])) {
                chars[i] = Character.toUpperCase(chars[i]);
                return new String(chars);
            }
        }

        return text;
    }

    private String movePeriodBeforeTrailingEmoji(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }

        return text.replaceAll("(\\p{So})\\.$", ". $1");
    }
}
