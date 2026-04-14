package com.sustainability.tracker.dto;

import com.sustainability.tracker.entity.BadgeDefinition;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Locale;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BadgeDefinitionDTO {
    private Long id;

    @NotBlank
    private String badgeName;

    @NotBlank
    private String badgeType;

    private String description;

    @DecimalMin(value = "0.0")
    private BigDecimal thresholdPercent;

    @NotNull
    private Boolean active;

    public static BadgeDefinitionDTO from(BadgeDefinition definition) {
        return new BadgeDefinitionDTO(
                definition.getId(),
                definition.getBadgeName(),
                normalizeBadgeType(definition.getBadgeType()),
                definition.getDescription(),
                definition.getThresholdPercent(),
                definition.getIsActive()
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
