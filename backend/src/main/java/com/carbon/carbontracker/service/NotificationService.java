package com.carbon.carbontracker.service;

import com.carbon.carbontracker.model.Notification;
import com.carbon.carbontracker.model.User;
import com.carbon.carbontracker.model.MarketplaceItem;
import com.carbon.carbontracker.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // USER: Get user notifications
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // USER: Mark as read
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    // ADMIN: Create notification (targeted or broadcast)
    public Notification createNotification(Long userId, String title, String message, String type) {
        Notification notification = new Notification();
        if (userId != null) {
            User user = new User();
            user.setId(userId);
            notification.setUser(user);
        }
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        return notificationRepository.save(notification);
    }

    // ADMIN: Edit notification
    public Notification updateNotification(Long id, String title, String message) {
        Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setTitle(title);
        notification.setMessage(message);
        return notificationRepository.save(notification);
    }

    // ADMIN: Delete notification
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    // ADMIN: Get all notifications
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // --- Integration / Auto-trigger Methods ---

    public void createPurchaseNotification(User user, MarketplaceItem item) {
        createNotification(user.getId(),
            "Purchase Successful 🛒",
            "You purchased " + item.getItemName() + " for ₹" + item.getPrice() + ". Thank you for supporting sustainability!",
            "PURCHASE");
    }

    public void createGoalCompletionNotification(User user, String goalName) {
        createNotification(user.getId(),
            "Goal Completed 🎯",
            "Congratulations! You completed your goal: " + goalName,
            "GOAL");
    }

    public void createBadgeNotification(User user, String badgeName) {
        createNotification(user.getId(),
            "Badge Earned 🏅",
            "You earned the \"" + badgeName + "\" badge! Keep up the great work.",
            "BADGE");
    }

    public void createLeaderboardNotification(User user, int newRank) {
        createNotification(user.getId(),
            "Leaderboard Update 🏆",
            "Your leaderboard rank has improved! You are now ranked #" + newRank,
            "LEADERBOARD");
    }

    public void createHighEmissionNotification(User user, double increasePercent) {
        createNotification(user.getId(),
            "High Emission Alert ⚠️",
            "Your weekly emissions increased by " + (int) increasePercent + "%. Consider reducing transport usage.",
            "EMISSION");
    }
}