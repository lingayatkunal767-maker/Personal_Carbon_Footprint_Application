package com.carbon.carbon.service;

import com.carbon.carbon.entity.Badge;
import com.carbon.carbon.entity.User;
import com.carbon.carbon.repository.BadgeRepository;
import com.carbon.carbon.repository.GoalRepository;
import com.carbon.carbon.repository.TransactionRepository;
import com.carbon.carbon.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class BadgeAwardingService {

    private final BadgeRepository badgeRepository;
    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;

    public BadgeAwardingService(BadgeRepository badgeRepository,
                                UserRepository userRepository,
                                GoalRepository goalRepository,
                                TransactionRepository transactionRepository,
                                NotificationService notificationService) {
        this.badgeRepository = badgeRepository;
        this.userRepository = userRepository;
        this.goalRepository = goalRepository;
        this.transactionRepository = transactionRepository;
        this.notificationService = notificationService;
    }

    /**
     * Check all badge conditions and award as needed after a carbon log entry.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void checkAndAwardBadges(Long userId) {
        log.debug("Checking badges for user ID: {}", userId);
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                log.warn("User not found with ID: {} — skipping badge check", userId);
                return;
            }

            long badgeCount = badgeRepository.countByUserId(userId);

            // Carbon Tracker — first log entry
            if (badgeCount == 0) {
                awardIfAbsent(user, "Carbon Tracker", "Logged your first carbon emission");
            }

            // Goal Setter — has at least one goal
            long goalCount = goalRepository.countByUserIdAndStatus(userId, "active")
                    + goalRepository.countByUserIdAndStatus(userId, "completed");
            if (goalCount > 0) {
                awardIfAbsent(user, "Goal Setter", "Created your first carbon reduction goal");
            }

            // Green Shopper — has at least one transaction
            long txCount = transactionRepository.countByUserId(userId);
            if (txCount > 0) {
                awardIfAbsent(user, "Green Shopper", "Made your first carbon credit purchase");
            }

        } catch (Exception e) {
            log.error("Error checking badges for user ID: {}", userId, e);
        }
    }

    /**
     * Award goal-completion-specific badges.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void awardGoalCompletionBadges(Long userId) {
        log.debug("Awarding goal completion badges for user ID: {}", userId);
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                log.warn("User not found with ID: {} — skipping goal badge award", userId);
                return;
            }

            long completedGoals = goalRepository.countByUserIdAndStatus(userId, "completed");

            if (completedGoals >= 1) {
                awardIfAbsent(user, "Green Achiever", "Completed your first carbon reduction goal");
            }
            if (completedGoals >= 5) {
                awardIfAbsent(user, "Goal Champion", "Completed 5 carbon reduction goals");
            }
            if (completedGoals >= 10) {
                awardIfAbsent(user, "Goal Legend", "Completed 10 carbon reduction goals");
            }

        } catch (Exception e) {
            log.error("Error awarding goal completion badges for user ID: {}", userId, e);
        }
    }

    /**
     * Award marketplace-related badges after a purchase.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void awardMarketplaceBadges(Long userId) {
        log.debug("Awarding marketplace badges for user ID: {}", userId);
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                log.warn("User not found with ID: {} — skipping marketplace badge award", userId);
                return;
            }

            long txCount = transactionRepository.countByUserId(userId);

            if (txCount >= 1) {
                awardIfAbsent(user, "Green Shopper", "Made your first carbon credit purchase");
            }
            if (txCount >= 5) {
                awardIfAbsent(user, "Carbon Investor", "Completed 5 carbon credit purchases");
            }
            if (txCount >= 20) {
                awardIfAbsent(user, "Eco Philanthropist", "Completed 20 carbon credit purchases");
            }

        } catch (Exception e) {
            log.error("Error awarding marketplace badges for user ID: {}", userId, e);
        }
    }

    // ------------------------------------------------------------------ helpers

    private void awardIfAbsent(User user, String badgeName, String description) {
        if (!badgeRepository.existsByUserIdAndBadgeName(user.getId(), badgeName)) {
            Badge badge = new Badge();
            badge.setUser(user);
            badge.setBadgeName(badgeName);
            badge.setDescription(description);
            badgeRepository.save(badge);
            log.info("Awarded badge '{}' to user ID: {}", badgeName, user.getId());
            
            notificationService.createNotification(user.getId(), "You earned the " + badgeName + " badge! " + description, "BADGE");
        }
    }
}
