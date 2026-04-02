package com.sustainability.tracker.dto;

import com.sustainability.tracker.entity.Badge;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BadgeResponseDTO {
    private Long id;
    private String badgeName;
    private String badgeType;
    private LocalDateTime earnedDate;
    private String description;

    public static BadgeResponseDTO from(Badge badge) {
        return new BadgeResponseDTO(
                badge.getId(),
                badge.getBadgeName(),
                badge.getBadgeType(),
                badge.getEarnedDate(),
                badge.getDescription()
        );
    }
}
