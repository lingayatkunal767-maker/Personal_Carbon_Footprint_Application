package com.sustainability.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsDTO {
    private long totalUsers;
    private long activeUsers;
    private long totalSurveys;
    private long totalCarbonLogs;
    private BigDecimal totalPlatformEmissions;
    private List<CategoryTotalDTO> categoryBreakdown;
    private List<MonthlyStatsDTO> monthlyTrend;
}
