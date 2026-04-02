package com.carbon.carbon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoalDTO {
    private Long id;
    private Long userId;
    private String goalTitle;
    private BigDecimal targetEmission;
    private BigDecimal currentEmission;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String category;
    private String timeframe;
    private String recurrence;
    private String description;
    private String goalType;
    private double progressPercentage;
}
