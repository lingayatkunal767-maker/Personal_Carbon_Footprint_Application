package com.sustainability.tracker.dto;

import com.sustainability.tracker.entity.Badge;
import com.sustainability.tracker.entity.BadgeDefinition;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BadgeTypeNormalizationTest {

    @Test
    void badgeResponseNormalizesLegacyTypes() {
        Badge badge = new Badge();
        badge.setId(1L);
        badge.setBadgeName("Legacy Badge");
        badge.setBadgeType("beginner");

        BadgeResponseDTO dto = BadgeResponseDTO.from(badge);
        assertEquals("MILESTONE", dto.getBadgeType());

        badge.setBadgeType("social");
        dto = BadgeResponseDTO.from(badge);
        assertEquals("CATEGORY", dto.getBadgeType());
    }

    @Test
    void badgeDefinitionNormalizesLegacyTypes() {
        BadgeDefinition definition = new BadgeDefinition();
        definition.setId(2L);
        definition.setBadgeName("Definition Badge");
        definition.setBadgeType("streak");
        definition.setIsActive(true);

        BadgeDefinitionDTO dto = BadgeDefinitionDTO.from(definition);
        assertEquals("MILESTONE", dto.getBadgeType());

        definition.setBadgeType("transport");
        dto = BadgeDefinitionDTO.from(definition);
        assertEquals("CATEGORY", dto.getBadgeType());
    }
}
