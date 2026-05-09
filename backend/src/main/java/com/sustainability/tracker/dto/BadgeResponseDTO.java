package com.sustainability.tracker.dto;

import com.sustainability.tracker.entity.Badge;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Locale;

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
                normalizeBadgeType(badge.getBadgeType()),
                badge.getEarnedDate(),
                badge.getDescription()
        );
    }

    private static String normalizeBadgeType(String badgeType) {
        if (badgeType == null || badgeType.isBlank()) {
            return "ACHIEVEMENT";
        }

        String normalized = badgeType.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "BEGINNER", "STREAK" -> "MILESTONE";
            case "TRANSPORT", "SOCIAL" -> "CATEGORY";
            default -> normalized;
        };
    }
}
