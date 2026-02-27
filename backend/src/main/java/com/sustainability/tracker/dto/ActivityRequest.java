package com.sustainability.tracker.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ActivityRequest {
    private Long userId;
    private String activityType;   // transport, energy, food, shopping, offset, etc.
    private String activityName;
    private BigDecimal carbonAmount; // positive = emission added, negative = offset
    private LocalDate activityDate;
    private String description;
}
