package com.ecotrack.backend.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private String userName;
    private String memberSince;
    private double totalCarbonKg;
    private double thisMonthCarbonKg;
    private double lastMonthCarbonKg;
    private double monthlyChangePercent;
    // Period-specific fields used by frontend time filter
    private double periodCarbonKg;
    private String periodLabel;
    private Map<String, Double> categoryBreakdown;
    private List<WeeklyPoint> weeklyTrend;
    private long activeGoals;
    private long completedGoals;
    private long totalBadges;
    private int leaderboardRank;
    // Survey footprint
    private Double estimatedAnnualFootprint;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class WeeklyPoint {
        private String date;
        private double amount;
    }
}
