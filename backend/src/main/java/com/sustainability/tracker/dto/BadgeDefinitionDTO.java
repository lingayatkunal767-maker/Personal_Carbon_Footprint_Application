package com.sustainability.tracker.dto;

import com.sustainability.tracker.entity.BadgeDefinition;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

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
                definition.getBadgeType(),
                definition.getDescription(),
                definition.getThresholdPercent(),
                definition.getIsActive()
        );
    }
}
