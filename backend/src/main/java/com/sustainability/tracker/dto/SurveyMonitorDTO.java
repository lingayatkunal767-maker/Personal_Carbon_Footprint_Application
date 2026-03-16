package com.sustainability.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyMonitorDTO {
    private Long surveyId;
    private Long userId;
    private String userName;
    private String userEmail;
    private LocalDate surveyDate;
    private String transportMode;
    private BigDecimal distanceKmPerDay;
    private Integer mealsNonVegPerWeek;
    private Integer mealsVegPerWeek;
    private BigDecimal electricityKwhPerMonth;
    private BigDecimal cookingGasCylindersPerMonth;
    private BigDecimal totalEmission;
    private boolean unrealistic;
    private String issueReason;
}
