package com.sustainability.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private StatsDTO stats;
    private List<CarbonLogResponse> recentLogs;
    private List<MonthlyStatsDTO> monthlyComparison;
    private List<EmissionsBreakdownDTO> emissionsBreakdown;
    private BigDecimal weeklyTotal;
    private BigDecimal changePercentage;
}
