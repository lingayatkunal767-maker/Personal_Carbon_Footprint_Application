package com.carbon.carbon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetricsDTO {
    private Long userId;
    private String userName;
    
    // Quick Stats
    private Double todayEmissions;
    private Double weeklyEmissions;
    private Double monthlyEmissions;
    private BigDecimal currentLeaderboardScore;
    
    // Goal Metrics
    private Long activeGoalsCount;
    private Double goalsCompletionPercentage;
    private Long goalsCompletedThisMonth;
    
    // Achievement Metrics
    private Long badgesEarned;
    private String topBadge;
    private Long daysStreak;
    
    // Marketplace Metrics
    private Long purchasesCount;
    private BigDecimal totalSpent;
    private String currentTier;
    
    // Leaderboard Position
    private String teamName;
    private Long currentRank;
    private Long rankChangeThisMonth;
    
    // Recommendations
    private List<String> recommendations;
    private List<String> availableBadges;
    private String nextGoalSuggestion;
    
    // Last Activity
    private String lastActivityType;
    private String lastActivityTime;
}
