package com.carboncalc.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BadgeResponse {
    private Long id;
    private String badgeName;
    private String description;
    private String icon;
    private String bgColor;
    private String rarity;
    private Integer rewardPoints;
    private Boolean isClaimed;
    private LocalDateTime awardedAt;
    private LocalDateTime claimedAt;
}
