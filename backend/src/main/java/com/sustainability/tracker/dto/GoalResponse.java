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
public class GoalResponse {
    private Long id;
    private Long userId;
    private String goalType;
    private BigDecimal targetValue;
    private BigDecimal currentValue;
    private LocalDate deadline;
    private String status;
    private LocalDateTime createdAt;
}
