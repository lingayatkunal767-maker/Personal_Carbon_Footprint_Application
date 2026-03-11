package com.carbon.carbon.service;

import com.carbon.carbon.dto.DashboardMetricsDTO;
import com.carbon.carbon.dto.UserStatisticsDTO;
import com.carbon.carbon.entity.*;
import com.carbon.carbon.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final BadgeRepository badgeRepository;
    private final LeaderboardRepository leaderboardRepository;
    private final TransactionRepository transactionRepository;
    private final CarbonLogRepository carbonLogRepository;

    public DashboardService(
            UserRepository userRepository,
            GoalRepository goalRepository,
            BadgeRepository badgeRepository,
            LeaderboardRepository leaderboardRepository,
            TransactionRepository transactionRepository,
            CarbonLogRepository carbonLogRepository) {
        this.userRepository = userRepository;
        this.goalRepository = goalRepository;
        this.badgeRepository = badgeRepository;
        this.leaderboardRepository = leaderboardRepository;
        this.transactionRepository = transactionRepository;
        this.carbonLogRepository = carbonLogRepository;
    }

    @Transactional(readOnly = true)
    public DashboardMetricsDTO getDashboardMetrics(Long userId) {
        try {
            log.info("Fetching dashboard metrics for user: {}", userId);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));

            DashboardMetricsDTO metrics = new DashboardMetricsDTO();
            metrics.setUserId(userId);
            metrics.setUserName(user.getName());

            // Emission Metrics - calculate from carbon logs
            Double totalEmissions = carbonLogRepository.findAll().stream()
                    .filter(log -> log.getUser().getId().equals(userId))
                    .mapToDouble(log -> log.getTotalEmission())
                    .sum();
            metrics.setMonthlyEmissions(totalEmissions);
            metrics.setTodayEmissions(0.0);
            metrics.setWeeklyEmissions(0.0);

            // Goal Metrics
            List<Goal> allGoals = goalRepository.findByUserId(userId);
            List<Goal> activeGoals = allGoals.stream()
                    .filter(g -> "active".equalsIgnoreCase(g.getStatus()))
                    .collect(Collectors.toList());

            metrics.setActiveGoalsCount((long) activeGoals.size());

            Long completedGoalsThisMonth = allGoals.stream()
                    .filter(g -> "completed".equalsIgnoreCase(g.getStatus()) &&
                            g.getCreatedAt().isAfter(LocalDateTime.now().minusMonths(1)))
                    .count();
            metrics.setGoalsCompletedThisMonth(completedGoalsThisMonth);

            double goalsPercentage = activeGoals.isEmpty() ? 0 :
                    (completedGoalsThisMonth.doubleValue() / (activeGoals.size() + completedGoalsThisMonth)) * 100;
            metrics.setGoalsCompletionPercentage(goalsPercentage);

            // Badge Metrics
            List<Badge> userBadges = badgeRepository.findByUserId(userId);
            metrics.setBadgesEarned((long) userBadges.size());

            if (!userBadges.isEmpty()) {
                metrics.setTopBadge(userBadges.get(userBadges.size() - 1).getBadgeName());
            }

            // Marketplace Metrics
            List<Transaction> userTransactions = transactionRepository.findByUserId(userId);
            metrics.setPurchasesCount((long) userTransactions.size());

            BigDecimal totalSpent = userTransactions.stream()
                    .map(t -> t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            metrics.setTotalSpent(totalSpent);

            // Leaderboard Metrics
            Leaderboard leaderboard = leaderboardRepository.findByUserId(userId)
                    .orElse(null);

            if (leaderboard != null) {
                metrics.setCurrentLeaderboardScore(leaderboard.getScore());
                metrics.setTeamName(leaderboard.getTeamName());
                metrics.setCurrentTier("Platinum");
                
                List<Leaderboard> allLeaderboards = leaderboardRepository.findAll();
                long rank = allLeaderboards.stream()
                        .filter(l -> l.getScore().compareTo(leaderboard.getScore()) > 0)
                        .count() + 1;
                metrics.setCurrentRank(rank);
            } else {
                metrics.setCurrentLeaderboardScore(BigDecimal.ZERO);
                metrics.setCurrentTier("Starter");
                metrics.setCurrentRank(null);
            }

            // Recommendations
            List<String> recommendations = generateRecommendations(activeGoals, userBadges);
            metrics.setRecommendations(recommendations);

            List<String> availableBadges = generateAvailableBadges(userBadges.size());
            metrics.setAvailableBadges(availableBadges);

            log.info("Dashboard metrics successfully fetched for user: {}", userId);
            return metrics;

        } catch (Exception e) {
            log.error("Error fetching dashboard metrics for user: {}", userId, e);
            return new DashboardMetricsDTO();
        }
    }

    @Transactional(readOnly = true)
    public UserStatisticsDTO getUserStatistics(Long userId) {
        try {
            log.info("Fetching comprehensive statistics for user: {}", userId);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));

            UserStatisticsDTO stats = new UserStatisticsDTO();
            stats.setUserId(userId);
            stats.setUserName(user.getName());
            stats.setEmail(user.getEmail());

            // Total Emissions from carbon logs
            Double totalEmissions = carbonLogRepository.findAll().stream()
                    .filter(log -> log.getUser().getId().equals(userId))
                    .mapToDouble(log -> log.getTotalEmission())
                    .sum();
            stats.setTotalEmissions(totalEmissions);
            stats.setMonthlyEmissions(totalEmissions);

            // Average Daily Emissions
            stats.setAverageEmissionsPerDay(totalEmissions / 30.0);

            // Goal Statistics
            List<Goal> allGoals = goalRepository.findByUserId(userId);
            List<Goal> activeGoals = allGoals.stream()
                    .filter(g -> "active".equalsIgnoreCase(g.getStatus()))
                    .collect(Collectors.toList());
            List<Goal> completedGoals = allGoals.stream()
                    .filter(g -> "completed".equalsIgnoreCase(g.getStatus()))
                    .collect(Collectors.toList());

            stats.setActiveGoalCount((long) activeGoals.size());
            stats.setCompletedGoalCount((long) completedGoals.size());

            BigDecimal totalTargetEmission = allGoals.stream()
                    .map(g -> g.getTargetEmission() != null ? g.getTargetEmission() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            stats.setTotalTargetEmission(totalTargetEmission);

            BigDecimal totalCurrentEmission = allGoals.stream()
                    .map(g -> g.getCurrentEmission() != null ? g.getCurrentEmission() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            stats.setTotalCurrentEmission(totalCurrentEmission);

            double goalsProgress = totalTargetEmission.compareTo(BigDecimal.ZERO) > 0 ?
                    (totalCurrentEmission.doubleValue() / totalTargetEmission.doubleValue()) * 100 : 0;
            stats.setGoalsProgressPercentage(goalsProgress);

            // Badge Statistics
            List<Badge> badges = badgeRepository.findByUserId(userId);
            stats.setTotalBadges((long) badges.size());
            stats.setRecentBadges(badges.stream()
                    .sorted(Comparator.comparing(Badge::getAwardedAt).reversed())
                    .limit(5)
                    .map(Badge::getBadgeName)
                    .collect(Collectors.toList()));

            // Leaderboard Statistics
            Leaderboard leaderboard = leaderboardRepository.findByUserId(userId).orElse(null);
            if (leaderboard != null) {
                stats.setTeamName(leaderboard.getTeamName());
                stats.setLeaderboardScore(leaderboard.getScore());
                List<Leaderboard> allLeaderboards = leaderboardRepository.findAll();
                long rank = allLeaderboards.stream()
                        .filter(l -> l.getScore().compareTo(leaderboard.getScore()) > 0)
                        .count() + 1;
                stats.setLeaderboardRank(rank);
            }

            // Transaction Statistics
            List<Transaction> transactions = transactionRepository.findByUserId(userId);
            stats.setTransactionCount((long) transactions.size());

            BigDecimal totalAmount = transactions.stream()
                    .map(t -> t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            stats.setTotalTransactionAmount(totalAmount);

            String tier = determineTier(transactions.size());
            stats.setTransactionTier(tier);

            BigDecimal rewards = BigDecimal.valueOf(transactions.size() * 5L);
            stats.setTransactionRewards(rewards);

            // Overall Progress
            double overallProgress = (goalsProgress + (badges.size() * 10.0) + (transactions.size() * 5.0)) / 3;
            stats.setOverallProgressPercentage(Math.min(overallProgress, 100.0));

            stats.setUserLevel(determineLevel(badges.size(), totalEmissions, completedGoals.size()));
            stats.setNextMilestone(determineNextMilestone(badges.size(), totalEmissions));

            log.info("User statistics successfully fetched for user: {}", userId);
            return stats;

        } catch (Exception e) {
            log.error("Error fetching statistics for user: {}", userId, e);
            return new UserStatisticsDTO();
        }
    }

    private List<String> generateRecommendations(List<Goal> activeGoals, List<Badge> badges) {
        List<String> recommendations = new ArrayList<>();

        if (activeGoals.isEmpty()) {
            recommendations.add("Set a carbon reduction goal to get started!");
        }

        if (badges.size() < 5) {
            recommendations.add("Complete more activities to earn badges!");
        }

        activeGoals.forEach(goal -> {
            if (goal.getCurrentEmission().compareTo(goal.getTargetEmission()) > 0) {
                recommendations.add("You're exceeding your goal: " + goal.getGoalTitle());
            }
        });

        return recommendations;
    }

    private List<String> generateAvailableBadges(int earnedBadges) {
        List<String> available = new ArrayList<>();
        if (earnedBadges < 1) available.add("Carbon Tracker");
        if (earnedBadges < 2) available.add("Goal Setter");
        if (earnedBadges < 3) available.add("Green Shopper");
        return available;
    }

    private String determineTier(int transactionCount) {
        if (transactionCount >= 50) return "Platinum Investor";
        if (transactionCount >= 25) return "Investor";
        if (transactionCount >= 10) return "Trader";
        if (transactionCount >= 5) return "Supporter";
        return "Starter";
    }

    private String determineLevel(int badgeCount, Double totalEmissions, long completedGoals) {
        if (badgeCount >= 10 && totalEmissions >= 5000 && completedGoals >= 5) return "Hero";
        if (badgeCount >= 8 && totalEmissions >= 1000 && completedGoals >= 3) return "Champion";
        if (badgeCount >= 5 && totalEmissions >= 500 && completedGoals >= 2) return "Eco Warrior";
        if (badgeCount >= 2) return "Green Advocate";
        return "Beginner";
    }

    private String determineNextMilestone(int badgeCount, Double totalEmissions) {
        if (badgeCount < 2) return "Earn your first badge!";
        if (totalEmissions < 100) return "Reach 100 kg emissions logged";
        if (badgeCount < 5) return "Earn 5 badges";
        return "Reach Hero level!";
    }
}
