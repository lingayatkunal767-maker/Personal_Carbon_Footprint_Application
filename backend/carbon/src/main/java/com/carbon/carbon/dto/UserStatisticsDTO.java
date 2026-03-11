package com.carbon.carbon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatisticsDTO {
    private Long userId;
    private String userName;
    private String email;
    
    // Emission Statistics
    private Double totalEmissions;
    private Double monthlyEmissions;
    private Double averageEmissionsPerDay;
    
    // Goal Statistics
    private Long activeGoalCount;
    private Long completedGoalCount;
    private BigDecimal totalTargetEmission;
    private BigDecimal totalCurrentEmission;
    private Double goalsProgressPercentage;
    
    // Badge Statistics
    private Long totalBadges;
    private List<String> recentBadges;
    
    // Leaderboard Statistics
    private String teamName;
    private BigDecimal leaderboardScore;
    private Long leaderboardRank;
    
    // Transaction Statistics
    private Long transactionCount;
    private BigDecimal totalTransactionAmount;
    private String transactionTier;
    private BigDecimal transactionRewards;
    
    // Overall Statistics
    private Double overallProgressPercentage;
    private String userLevel;
    private String nextMilestone;
}
