package com.sustainability.tracker.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BadgeAssignmentRequest {
    @NotNull
    private Long userId;

    @NotNull
    private Long badgeDefinitionId;

    private String reason;
}
