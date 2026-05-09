package com.sustainability.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoalRequest {

    private Long userId;

    // example: "transport", "food", "energy", "total"
    private String goalType;

    private BigDecimal targetValue;   // <-- MUST MATCH service usage
    private BigDecimal currentValue;  // optional from client
    private LocalDate deadline;

    // example: "Active", "Completed"
    private String status;
}
