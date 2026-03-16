package com.sustainability.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmissionsBreakdownDTO {
    private String activityType;    // transport, energy, food, waste
    private BigDecimal totalCarbon;
    private double percentage;      // % of total
}
