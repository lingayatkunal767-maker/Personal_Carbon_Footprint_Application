package com.sustainability.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EcoTipDTO {
    private String id;
    private String icon;
    private String bg;
    private String title;
    private String description;
    private String savings;
}
