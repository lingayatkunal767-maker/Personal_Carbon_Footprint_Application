package com.carboncalc.backend.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class BadgeDefinitionRequest {
    private String badgeName;
    private String description;
    private String icon;
    private String requirement;
    private String bgColor;
}
