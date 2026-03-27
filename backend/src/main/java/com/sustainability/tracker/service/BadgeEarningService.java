package com.sustainability.tracker.service;

import com.sustainability.tracker.entity.Badge;
import com.sustainability.tracker.entity.CarbonLog;
import com.sustainability.tracker.entity.User;
import com.sustainability.tracker.repository.BadgeRepository;
import com.sustainability.tracker.repository.CarbonLogRepository;
import com.sustainability.tracker.repository.GoalRepository;
import com.sustainability.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;

/**
 * Badge Earning Service
 * Automatically awards badges based on user achievements
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class BadgeEarningService {

    private final BadgeRepository badgeRepository;
    private final CarbonLogRepository carbonLogRepository;
    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * Check and award badges for a user after a carbon log is created
     */
    public void checkAndAwardBadges(Long userId) {
        log.info("Checking badges for user: {}", userId);

        Long safeUserId = Objects.requireNonNull(userId, "userId is required");
        User user = userRepository.findById(safeUserId).orElse(null);
        if (user == null) return;

        // Check various badge criteria
        checkFirstStepBadge(user);
        checkStreakBadges(user);
        checkTotalEmissionBadges(user);
        checkGoalCompletionBadges(user);
        checkLowEmissionDayBadges(user);
        checkCategoryMasterBadges(user);
    }

    /**
     * First Step Badge - First carbon log
     */
    private void checkFirstStepBadge(User user) {
        if (hasBadge(user.getId(), "First Step")) return;

        long logCount = carbonLogRepository.count();
        if (logCount >= 1) {
            awardBadge(user, "First Step", "MILESTONE", 
                "Started your carbon tracking journey! 🌱");
        }
    }

    /**
     * Streak Badges - Consecutive days of logging
     */
    private void checkStreakBadges(User user) {
        int streak = calculateStreak(user.getId());
        
        if (streak >= 7 && !hasBadge(user.getId(), "Week Warrior")) {
            awardBadge(user, "Week Warrior", "STREAK", 
                "Logged carbon footprint for 7 consecutive days! 🔥");
        }
        
        if (streak >= 30 && !hasBadge(user.getId(), "Month Master")) {
            awardBadge(user, "Month Master", "STREAK", 
                "30-day logging streak! You're on fire! 🏆");
        }
        
        if (streak >= 100 && !hasBadge(user.getId(), "Century Champion")) {
            awardBadge(user, "Century Champion", "STREAK", 
                "100 days of consistent tracking! Legendary! 👑");
        }
    }

    /**
     * Total Emission Reduction Badges
     */
    private void checkTotalEmissionBadges(User user) {
        List<CarbonLog> logs = carbonLogRepository.findByUserIdOrderByLogDate(user.getId());
        
        if (logs.isEmpty()) return;

        // Calculate total emissions over time
        BigDecimal totalEmissions = logs.stream()
                .map(log -> log.getTotalEmission() != null ? log.getTotalEmission() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Award badges based on tracking volume
        if (totalEmissions.compareTo(new BigDecimal("100")) >= 0 && !hasBadge(user.getId(), "Carbon Conscious")) {
            awardBadge(user, "Carbon Conscious", "MILESTONE", 
                "Tracked over 100 kg of CO2e! Knowledge is power! 💡");
        }
        
        if (totalEmissions.compareTo(new BigDecimal("1000")) >= 0 && !hasBadge(user.getId(), "Data Driven")) {
            awardBadge(user, "Data Driven", "MILESTONE", 
                "Tracked over 1000 kg of CO2e! You're serious about this! 📊");
        }
    }

    /**
     * Goal Completion Badges
     */
    private void checkGoalCompletionBadges(User user) {
        long completedGoals = goalRepository.countByUserIdAndStatus(user.getId(), "completed");
        
        if (completedGoals >= 1 && !hasBadge(user.getId(), "Goal Getter")) {
            awardBadge(user, "Goal Getter", "ACHIEVEMENT", 
                "Completed your first carbon reduction goal! 🎯");
        }
        
        if (completedGoals >= 5 && !hasBadge(user.getId(), "Goal Master")) {
            awardBadge(user, "Goal Master", "ACHIEVEMENT", 
                "Completed 5 carbon reduction goals! Unstoppable! 🚀");
        }
    }

    /**
     * Low Emission Day Badges
     */
    private void checkLowEmissionDayBadges(User user) {
        List<CarbonLog> recentLogs = carbonLogRepository
                .findByUserIdAndLogDateBetweenOrderByLogDate(
                        user.getId(),
                        LocalDate.now().minusDays(30),
                        LocalDate.now()
                );

        long lowEmissionDays = recentLogs.stream()
                .filter(log -> log.getTotalEmission() != null && 
                              log.getTotalEmission().compareTo(new BigDecimal("10")) < 0)
                .count();

        if (lowEmissionDays >= 5 && !hasBadge(user.getId(), "Eco Warrior")) {
            awardBadge(user, "Eco Warrior", "ACHIEVEMENT", 
                "Maintained low emissions for 5 days! Planet thanks you! 🌍");
        }
    }

    /**
     * Category Master Badges - Excellence in specific categories
     */
    private void checkCategoryMasterBadges(User user) {
        List<CarbonLog> logs = carbonLogRepository
                .findByUserIdAndLogDateBetweenOrderByLogDate(
                        user.getId(),
                        LocalDate.now().minusDays(30),
                        LocalDate.now()
                );

        if (logs.isEmpty()) return;

        // Calculate average emissions per category
        BigDecimal avgTransport = logs.stream()
                .map(log -> log.getTransportEmission() != null ? log.getTransportEmission() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(new BigDecimal(logs.size()), 2, RoundingMode.HALF_UP);

        BigDecimal avgFood = logs.stream()
                .map(log -> log.getFoodEmission() != null ? log.getFoodEmission() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(new BigDecimal(logs.size()), 2, RoundingMode.HALF_UP);

        BigDecimal avgEnergy = logs.stream()
                .map(log -> log.getEnergyEmission() != null ? log.getEnergyEmission() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(new BigDecimal(logs.size()), 2, RoundingMode.HALF_UP);

        // Award badges for low category emissions
        if (avgTransport.compareTo(new BigDecimal("2")) < 0 && !hasBadge(user.getId(), "Green Commuter")) {
            awardBadge(user, "Green Commuter", "CATEGORY", 
                "Average transport emissions below 2 kg/day! 🚴");
        }

        if (avgFood.compareTo(new BigDecimal("3")) < 0 && !hasBadge(user.getId(), "Plant Pioneer")) {
            awardBadge(user, "Plant Pioneer", "CATEGORY", 
                "Average food emissions below 3 kg/day! 🌱");
        }

        if (avgEnergy.compareTo(new BigDecimal("5")) < 0 && !hasBadge(user.getId(), "Energy Saver")) {
            awardBadge(user, "Energy Saver", "CATEGORY", 
                "Average energy emissions below 5 kg/day! ⚡");
        }
    }

    /**
     * Calculate consecutive day streak
     */
    private int calculateStreak(Long userId) {
        List<CarbonLog> logs = carbonLogRepository.findByUserIdOrderByLogDate(userId);
        
        if (logs.isEmpty()) return 0;

        int streak = 1;
        LocalDate today = LocalDate.now();
        
        // Start from most recent log
        LocalDate currentDate = logs.get(logs.size() - 1).getLogDate();
        
        // If most recent log is not today or yesterday, streak is broken
        if (ChronoUnit.DAYS.between(currentDate, today) > 1) {
            return 0;
        }

        // Count backwards
        for (int i = logs.size() - 2; i >= 0; i--) {
            LocalDate prevDate = logs.get(i).getLogDate();
            if (ChronoUnit.DAYS.between(prevDate, currentDate) == 1) {
                streak++;
                currentDate = prevDate;
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * Check if user already has a badge
     */
    private boolean hasBadge(Long userId, String badgeName) {
        return badgeRepository.existsByUserIdAndBadgeName(userId, badgeName);
    }

    /**
     * Award a badge to a user
     */
    private void awardBadge(User user, String badgeName, String badgeType, String description) {
        Badge badge = new Badge();
        badge.setUser(user);
        badge.setBadgeName(badgeName);
        badge.setBadgeType(badgeType);
        badge.setDescription(description);
        
        badgeRepository.save(badge);
        
        log.info("✅ Awarded badge '{}' to user {}", badgeName, user.getId());
        
        // Send notification
        notificationService.notifyBadgeEarned(user.getId(), badgeName, description);
    }
}
