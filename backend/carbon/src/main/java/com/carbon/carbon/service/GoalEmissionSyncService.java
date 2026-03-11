package com.carbon.carbon.service;

import com.carbon.carbon.entity.Goal;
import com.carbon.carbon.repository.GoalRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@Transactional
public class GoalEmissionSyncService {

    private final GoalRepository goalRepository;

    public GoalEmissionSyncService(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    /**
     * Update user's goals based on new emission recorded
     * Called when a new emission record is created
     */
    public void syncEmissionWithGoals(Long userId, BigDecimal emissionAmount) {
        log.debug("Syncing emission with goals for user ID: {} with emission: {}", userId, emissionAmount);

        if (userId == null || emissionAmount == null || emissionAmount.compareTo(BigDecimal.ZERO) < 0) {
            log.warn("Invalid parameters for goal sync: userId={}, emissionAmount={}", userId, emissionAmount);
            return;
        }

        try {
            // Get all active goals for the user
            List<Goal> activeGoals = goalRepository.findByUserIdAndStatus(userId, "active");

            if (activeGoals.isEmpty()) {
                log.debug("No active goals found for user ID: {}", userId);
                return;
            }

            // Update each active goal with the new emission
            for (Goal goal : activeGoals) {
                BigDecimal oldEmission = goal.getCurrentEmission();
                BigDecimal newEmission = oldEmission.add(emissionAmount);
                goal.setCurrentEmission(newEmission);

                // Check if goal is now completed
                if (newEmission.compareTo(goal.getTargetEmission()) >= 0) {
                    goal.setStatus("completed");
                    log.info("Goal ID: {} reached target for user ID: {}", goal.getId(), userId);
                }

                goalRepository.save(goal);
            }

            log.info("Successfully synced {} active goals for user ID: {}", activeGoals.size(), userId);
        } catch (Exception e) {
            log.error("Error syncing emission with goals for user ID: {}", userId, e);
        }
    }

    /**
     * Get remaining emission capacity for all active goals
     */
    public BigDecimal getRemainingEmissionCapacity(Long userId) {
        log.debug("Calculating remaining emission capacity for user ID: {}", userId);

        if (userId == null) {
            log.warn("User ID is required");
            return BigDecimal.ZERO;
        }

        try {
            List<Goal> activeGoals = goalRepository.findByUserIdAndStatus(userId, "active");

            if (activeGoals.isEmpty()) {
                return BigDecimal.ZERO;
            }

            // Return the total remaining capacity across all goals
            BigDecimal totalRemaining = BigDecimal.ZERO;
            for (Goal goal : activeGoals) {
                BigDecimal remaining = goal.getTargetEmission().subtract(goal.getCurrentEmission());
                if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                    totalRemaining = totalRemaining.add(remaining);
                }
            }

            return totalRemaining;
        } catch (Exception e) {
            log.error("Error calculating remaining emission capacity for user ID: {}", userId, e);
            return BigDecimal.ZERO;
        }
    }

    /**
     * Get total target emission across all active goals
     */
    public BigDecimal getTotalTargetEmission(Long userId) {
        log.debug("Calculating total target emission for user ID: {}", userId);

        if (userId == null) {
            log.warn("User ID is required");
            return BigDecimal.ZERO;
        }

        try {
            List<Goal> activeGoals = goalRepository.findByUserIdAndStatus(userId, "active");
            return activeGoals.stream()
                    .map(Goal::getTargetEmission)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } catch (Exception e) {
            log.error("Error calculating total target emission for user ID: {}", userId, e);
            return BigDecimal.ZERO;
        }
    }

    /**
     * Get current total emission across all active goals
     */
    public BigDecimal getTotalCurrentEmission(Long userId) {
        log.debug("Calculating total current emission for user ID: {}", userId);

        if (userId == null) {
            log.warn("User ID is required");
            return BigDecimal.ZERO;
        }

        try {
            List<Goal> activeGoals = goalRepository.findByUserIdAndStatus(userId, "active");
            return activeGoals.stream()
                    .map(Goal::getCurrentEmission)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } catch (Exception e) {
            log.error("Error calculating total current emission for user ID: {}", userId, e);
            return BigDecimal.ZERO;
        }
    }
}
