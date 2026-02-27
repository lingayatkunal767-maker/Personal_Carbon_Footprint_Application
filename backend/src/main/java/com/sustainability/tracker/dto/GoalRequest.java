package com.sustainability.tracker.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GoalRequest {
    private Long userId;
    private String goalType;        // goal name / description
    private BigDecimal targetValue; // target value (e.g. 100 for 100%)
    private BigDecimal currentValue;// current progress
    private LocalDate deadline;
    private String status;          // active, completed, failed
}
