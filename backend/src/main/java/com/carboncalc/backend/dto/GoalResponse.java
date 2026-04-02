package com.carboncalc.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GoalResponse {
    private Long id;
    private String goalTitle;
    private Double targetEmission;
    private Double currentEmission;
    private String status;
    private Double progressPct;
    private String category;
    private Integer reductionTarget;
    private String timeframe;
    private String recurrence;
    private String description;
    private LocalDateTime createdAt;
}
