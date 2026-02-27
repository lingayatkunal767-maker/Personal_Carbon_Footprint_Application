package com.sustainability.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatsDTO {
    private long totalActivities;
    private BigDecimal totalCarbonSaved;
    private BigDecimal monthlyCarbon;   // this month's savings
    private long activeGoals;
    private long badgeCount;
}
