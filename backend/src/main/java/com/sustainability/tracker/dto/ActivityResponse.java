package com.sustainability.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponse {
    private Long id;
    private Long userId;
    private String activityType;
    private String activityName;
    private BigDecimal carbonAmount;
    private LocalDate activityDate;
    private String description;
    private LocalDateTime createdAt;
}
