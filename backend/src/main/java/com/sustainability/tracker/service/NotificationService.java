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
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get unread notifications for a user
     */
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
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
        List<Notification> notifications = notificationRepository
                .findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        notifications.forEach(Notification::markAsRead);
        notificationRepository.saveAll(notifications);
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
        notification.setTitle(title);
        notification.setMessage(message);
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
}
