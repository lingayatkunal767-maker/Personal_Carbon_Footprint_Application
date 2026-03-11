package com.carbon.carbon.service;

import com.carbon.carbon.repository.TransactionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@Transactional(readOnly = true)
public class TransactionRewardService {

    private final TransactionRepository transactionRepository;
    private final LeaderboardScoreService leaderboardScoreService;
    private final BadgeAwardingService badgeAwardingService;

    public TransactionRewardService(TransactionRepository transactionRepository,
                                    LeaderboardScoreService leaderboardScoreService,
                                    BadgeAwardingService badgeAwardingService) {
        this.transactionRepository = transactionRepository;
        this.leaderboardScoreService = leaderboardScoreService;
        this.badgeAwardingService = badgeAwardingService;
    }

    /**
     * Process rewards for a marketplace transaction
     * Called after a transaction is created
     */
    @Transactional
    public void processTransactionRewards(Long userId, BigDecimal transactionAmount) {
        log.debug("Processing transaction rewards for user ID: {} with amount: {}", userId, transactionAmount);

        if (userId == null || transactionAmount == null || transactionAmount.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("Invalid parameters for transaction rewards: userId={}, amount={}", userId, transactionAmount);
            return;
        }

        try {
            // Award leaderboard bonus (convert amount to bonus points)
            // Formula: bonus = transaction_amount * 5
            BigDecimal bonusPoints = transactionAmount.multiply(new BigDecimal("5"));
            leaderboardScoreService.awardMarketplacePurchaseBonus(userId, bonusPoints);

            // Award marketplace badges
            badgeAwardingService.awardMarketplaceBadges(userId);

            long transactionCount = transactionRepository.countByUserId(userId);
            log.info("Transaction rewards processed for user ID: {} (Transaction count: {})", userId, transactionCount);
        } catch (Exception e) {
            log.error("Error processing transaction rewards for user ID: {}", userId, e);
        }
    }

    /**
     * Calculate transaction-based rewards
     */
    public BigDecimal calculateTransactionRewards(Long userId) {
        log.debug("Calculating transaction rewards for user ID: {}", userId);

        if (userId == null) {
            log.warn("User ID is required");
            return BigDecimal.ZERO;
        }

        try {
            // Get total transaction amount
            BigDecimal totalTransactions = transactionRepository.findByUserId(userId)
                    .stream()
                    .map(t -> t.getAmount())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Calculate rewards (total_transactions * 5)
            return totalTransactions.multiply(new BigDecimal("5"));
        } catch (Exception e) {
            log.error("Error calculating transaction rewards for user ID: {}", userId, e);
            return BigDecimal.ZERO;
        }
    }

    /**
     * Get transaction tier/level based on transaction count
     */
    public String getTransactionTier(Long userId) {
        log.debug("Getting transaction tier for user ID: {}", userId);

        if (userId == null) {
            log.warn("User ID is required");
            return "Starter";
        }

        try {
            long count = transactionRepository.countByUserId(userId);

            if (count == 0) return "Starter";
            if (count < 5) return "Supporter";
            if (count < 10) return "Trader";
            if (count < 20) return "Investor";
            return "Platinum Investor";
        } catch (Exception e) {
            log.error("Error getting transaction tier for user ID: {}", userId, e);
            return "Starter";
        }
    }
}
