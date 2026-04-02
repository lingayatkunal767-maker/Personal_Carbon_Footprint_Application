package com.carboncalc.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class GoalRequest {
    @NotBlank(message = "Goal title is required")
    private String goalTitle;

    @NotNull(message = "Target emission is required")
    @Min(value = 0, message = "Target must be non-negative")
    private Double targetEmission;

    private String category;
    private Integer reductionTarget;
    private String timeframe;
    private String recurrence;
    private String description;
}
