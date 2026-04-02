package com.carboncalc.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class AdminUserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private Boolean isActive;
    private long surveyCount;
    private long goalsCompleted;
    private long badgesEarned;
    private Double totalEmission;
}
