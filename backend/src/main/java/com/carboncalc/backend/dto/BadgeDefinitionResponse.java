package com.carboncalc.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BadgeDefinitionResponse {
    private Long id;
    private String badgeName;
    private String description;
    private String icon;
    private String requirement;
    private String bgColor;
    private String rarity;
    private Integer rewardPoints;
    private LocalDateTime createdAt;
}
