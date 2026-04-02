package com.carboncalc.backend.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LeaderboardResponse {
    private Integer rank;
    private Long userId;
    private String username;
    private Double score;          // composite score (lower = better)
    private Double totalEmissions; // avg kg CO₂ per survey
    private Integer goalsCompleted;
    private Double reductionPct;
    private boolean isCurrentUser;
}
