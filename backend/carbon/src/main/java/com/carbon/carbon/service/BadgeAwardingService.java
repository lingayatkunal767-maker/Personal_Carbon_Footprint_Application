package com.carbon.carbon.service;

import com.carbon.carbon.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
public class BadgeAwardingService {

    private final BadgeService badgeService;
    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final TransactionRepository transactionRepository;
    private final CarbonLogRepository carbonLogRepository;

    public BadgeAwardingService(BadgeService badgeService,
                                UserRepository userRepository,
                                GoalRepository goalRepository,
                                TransactionRepository transactionRepository,
                                CarbonLogRepository carbonLogRepository) {
        this.badgeService = badgeService;
        this.userRepository = userRepository;
        this.goalRepository = goalRepository;
        this.transactionRepository = transactionRepository;
        this.carbonLogRepository = carbonLogRepository;
    }

    /**
     * Check and award badges based on user activity
     * Called after emissions are recorded
     */
    public void checkAndAwardBadges(Long userId) {
        log.debug("Checking eligible badges for user ID: {}", userId);

        if (userId == null) {
            log.warn("User ID is required");
            return;
        }

        try {
            // Verify user exists
            userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            // Get user statistics
            long goalCount = goalRepository.findByUserId(userId).size();
            long transactionCount = transactionRepository.countByUserId(userId);
            double totalEmissions = carbonLogRepository.findAll().stream()
                    .filter(log -> log.getUser().getId().equals(userId))
                    .mapToDouble(log -> log.getTotalEmission())
                    .sum();

            // Award badges based on thresholds
            awardBasicBadges(userId, goalCount, transactionCount);
            awardAchievementBadges(userId, totalEmissions);

            log.debug("Badge eligibility check completed for user ID: {}", userId);
        } catch (Exception e) {
            log.error("Error checking and awarding badges for user ID: {}", userId, e);
        }
    }

    /**
     * Award basic achievement badges for first-time actions
     */
    private void awardBasicBadges(Long userId, long goalCount, long transactionCount) {
        log.debug("Awarding basic badges for user ID: {}", userId);

        try {
            // Carbon Tracker - First emission logged (checked in dashboard)
            if (!badgeService.hasBadge(userId, "Carbon Tracker")) {
                badgeService.awardBadge(userId, "Carbon Tracker",
                        "Logged your first carbon emission - Great start!");
            }

            // Goal Setter - Created first goal
            if (goalCount > 0 && !badgeService.hasBadge(userId, "Goal Setter")) {
                badgeService.awardBadge(userId, "Goal Setter",
                        "Created your first carbon reduction goal - Keep it up!");
            }

            // Green Shopper - Made first marketplace purchase
            if (transactionCount > 0 && !badgeService.hasBadge(userId, "Green Shopper")) {
                badgeService.awardBadge(userId, "Green Shopper",
                        "Made your first carbon credit purchase - Supporting the planet!");
            }
        } catch (Exception e) {
            log.error("Error awarding basic badges for user ID: {}", userId, e);
        }
    }

    /**
     * Award achievement badges based on emission milestones
     */
    private void awardAchievementBadges(Long userId, double totalEmissions) {
        log.debug("Awarding achievement badges for user ID: {} with total emissions: {}", userId, totalEmissions);

        try {
            // Eco Warrior - 100+ kg CO2 reduction tracked
            if (totalEmissions >= 100 && !badgeService.hasBadge(userId, "Eco Warrior")) {
                badgeService.awardBadge(userId, "Eco Warrior",
                        "Tracked 100+ kg of CO2 emissions - You're making a difference!");
            }

            // Carbon Champion - 500+ kg CO2 tracked
            if (totalEmissions >= 500 && !badgeService.hasBadge(userId, "Carbon Champion")) {
                badgeService.awardBadge(userId, "Carbon Champion",
                        "Tracked 500+ kg of CO2 emissions - True environmental champion!");
            }

            // Planet Protector - 1000+ kg CO2 tracked
            if (totalEmissions >= 1000 && !badgeService.hasBadge(userId, "Planet Protector")) {
                badgeService.awardBadge(userId, "Planet Protector",
                        "Tracked 1000+ kg of CO2 emissions - You're saving the planet!");
            }

            // Climate Hero - 5000+ kg CO2 tracked
            if (totalEmissions >= 5000 && !badgeService.hasBadge(userId, "Climate Hero")) {
                badgeService.awardBadge(userId, "Climate Hero",
                        "Tracked 5000+ kg of CO2 emissions - An absolute climate hero!");
            }
        } catch (Exception e) {
            log.error("Error awarding achievement badges for user ID: {}", userId, e);
        }
    }

    /**
     * Award milestone badges when goals are completed
     */
    public void awardGoalCompletionBadges(Long userId) {
        log.debug("Awarding goal completion badges for user ID: {}", userId);

        if (userId == null) {
            log.warn("User ID is required");
            return;
        }

        try {
            long completedGoals = goalRepository.countByUserIdAndStatus(userId, "completed");

            if (completedGoals >= 1 && !badgeService.hasBadge(userId, "Goal Master")) {
                badgeService.awardBadge(userId, "Goal Master",
                        "Completed your first carbon reduction goal - Committed to change!");
            }

            if (completedGoals >= 5 && !badgeService.hasBadge(userId, "Goal Crusader")) {
                badgeService.awardBadge(userId, "Goal Crusader",
                        "Completed 5 carbon reduction goals - Unstoppable force!");
            }

            log.info("Goal completion badges check completed for user ID: {}", userId);
        } catch (Exception e) {
            log.error("Error awarding goal completion badges for user ID: {}", userId, e);
        }
    }

    /**
     * Award marketplace badges based on transaction count
     */
    public void awardMarketplaceBadges(Long userId) {
        log.debug("Awarding marketplace badges for user ID: {}", userId);

        if (userId == null) {
            log.warn("User ID is required");
            return;
        }

        try {
            long transactionCount = transactionRepository.countByUserId(userId);

            if (transactionCount >= 5 && !badgeService.hasBadge(userId, "Market Trader")) {
                badgeService.awardBadge(userId, "Market Trader",
                        "Made 5 marketplace purchases - Supporting green initiatives!");
            }

            if (transactionCount >= 10 && !badgeService.hasBadge(userId, "Carbon Investor")) {
                badgeService.awardBadge(userId, "Carbon Investor",
                        "Made 10 marketplace purchases - Investing in the future!");
            }

            log.info("Marketplace badges check completed for user ID: {}", userId);
        } catch (Exception e) {
            log.error("Error awarding marketplace badges for user ID: {}", userId, e);
        }
    }
}
