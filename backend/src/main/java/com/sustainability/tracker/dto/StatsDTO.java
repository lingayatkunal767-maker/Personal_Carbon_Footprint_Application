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
    private BigDecimal totalCarbonSaved;  // total net carbon (positive = emitted)
    private BigDecimal monthlyCarbon;     // this month's net
    private BigDecimal weeklyEmissions;   // last 7 days positive emissions
    private BigDecimal totalOffset;       // total CO2 saved/offset (absolute of negatives)
    private long activeGoals;
    private long badgeCount;
    private long ecoPoints;               // computed: badgeCount*200 + activities*20
    private long streakDays;              // distinct activity days in last 30 days
}
