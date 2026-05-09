package com.sustainability.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyStatsDTO {
    private String month;       // e.g. "2026-01"
    private BigDecimal total;   // total carbon saved that month
}
