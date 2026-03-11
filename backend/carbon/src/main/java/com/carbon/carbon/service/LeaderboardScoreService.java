package com.carbon.carbon.service;

import com.carbon.carbon.entity.Leaderboard;
import com.carbon.carbon.repository.CarbonLogRepository;
import com.carbon.carbon.repository.LeaderboardRepository;
import com.carbon.carbon.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@Transactional
public class LeaderboardScoreService {

    private final LeaderboardRepository leaderboardRepository;
    private final UserRepository userRepository;
    private final CarbonLogRepository carbonLogRepository;

    public LeaderboardScoreService(LeaderboardRepository leaderboardRepository,
                                   UserRepository userRepository,
                                   CarbonLogRepository carbonLogRepository) {
        this.leaderboardRepository = leaderboardRepository;
        this.userRepository = userRepository;
        this.carbonLogRepository = carbonLogRepository;
    }

    /**
     * Update leaderboard score based on carbon reduction
     * Called when emissions are recorded
     */
    public void updateScoreBasedOnEmissions(Long userId, BigDecimal emissionAmount) {
        log.debug("Updating leaderboard score for user ID: {} with emission: {}", userId, emissionAmount);

        if (userId == null || emissionAmount == null || emissionAmount.compareTo(BigDecimal.ZERO) < 0) {
            log.warn("Invalid parameters for score update: userId={}, emissionAmount={}", userId, emissionAmount);
            return;
        }

        try {
            // Verify user exists
            userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            // Initialize leaderboard if not exists
            var leaderboardOpt = leaderboardRepository.findByUserId(userId);
            if (leaderboardOpt.isEmpty()) {
                log.debug("Creating leaderboard entry for user ID: {}", userId);
                Leaderboard lb = new Leaderboard();
                lb.setUser(userRepository.findById(userId).orElseThrow());
                lb.setTeamName("Individual");
                lb.setScore(BigDecimal.ZERO);
                leaderboardRepository.save(lb);
            }

            // Calculate score based on emission reduction
            // Score = emission_amount * 0.1 (configurable multiplier)
            BigDecimal scoreIncrease = emissionAmount.multiply(new BigDecimal("0.1"));

            // Update leaderboard
            Leaderboard leaderboard = leaderboardRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Leaderboard not found"));

            BigDecimal newScore = leaderboard.getScore().add(scoreIncrease);
            leaderboard.setScore(newScore);
            leaderboardRepository.save(leaderboard);

            log.info("Leaderboard score updated for user ID: {} - New score: {}", userId, newScore);
        } catch (Exception e) {
            log.error("Error updating leaderboard score for user ID: {}", userId, e);
        }
    }

    /**
     * Recalculate leaderboard score based on total emissions
     * Called periodically or on demand
     */
    public void recalculateScore(Long userId) {
        log.debug("Recalculating leaderboard score for user ID: {}", userId);

        if (userId == null) {
            log.warn("User ID is required");
            return;
        }

        try {
            var userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                throw new RuntimeException("User not found with ID: " + userId);
            }

            // Get total emissions for the user
            double totalEmissions = carbonLogRepository.findByUserOrderByDateDesc(userOpt.get())
                    .stream()
                    .mapToDouble(log -> log.getTotalEmission())
                    .sum();

            // Calculate new score (emissions tracked * 0.1)
            BigDecimal newScore = new BigDecimal(totalEmissions).multiply(new BigDecimal("0.1"));

            // Update or create leaderboard
            Leaderboard leaderboard = leaderboardRepository.findByUserId(userId)
                    .orElseGet(() -> {
                        Leaderboard lb = new Leaderboard();
                        lb.setUser(userRepository.findById(userId).orElseThrow());
                        lb.setTeamName("Individual");
                        return lb;
                    });

            leaderboard.setScore(newScore);
            leaderboardRepository.save(leaderboard);

            log.info("Leaderboard score recalculated for user ID: {} - New score: {}", userId, newScore);
        } catch (Exception e) {
            log.error("Error recalculating leaderboard score for user ID: {}", userId, e);
        }
    }

    /**
     * Bonus score for completing goals
     */
    public void awardGoalCompletionBonus(Long userId, BigDecimal bonusPoints) {
        log.debug("Awarding goal completion bonus to user ID: {} - Bonus: {}", userId, bonusPoints);

        if (userId == null || bonusPoints == null) {
            log.warn("User ID and bonus points are required");
            return;
        }

        try {
            Leaderboard leaderboard = leaderboardRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Leaderboard entry not found"));

            BigDecimal newScore = leaderboard.getScore().add(bonusPoints);
            leaderboard.setScore(newScore);
            leaderboardRepository.save(leaderboard);

            log.info("Goal completion bonus awarded to user ID: {} - New score: {}", userId, newScore);
        } catch (Exception e) {
            log.error("Error awarding goal completion bonus for user ID: {}", userId, e);
        }
    }

    /**
     * Bonus score for marketplace purchases
     */
    public void awardMarketplacePurchaseBonus(Long userId, BigDecimal bonusPoints) {
        log.debug("Awarding marketplace purchase bonus to user ID: {} - Bonus: {}", userId, bonusPoints);

        if (userId == null || bonusPoints == null) {
            log.warn("User ID and bonus points are required");
            return;
        }

        try {
            Leaderboard leaderboard = leaderboardRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Leaderboard entry not found"));

            BigDecimal newScore = leaderboard.getScore().add(bonusPoints);
            leaderboard.setScore(newScore);
            leaderboardRepository.save(leaderboard);

            log.info("Marketplace purchase bonus awarded to user ID: {} - New score: {}", userId, newScore);
        } catch (Exception e) {
            log.error("Error awarding marketplace purchase bonus for user ID: {}", userId, e);
        }
    }
}
