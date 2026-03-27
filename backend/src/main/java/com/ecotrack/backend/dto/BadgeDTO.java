package com.ecotrack.backend.dto;

import lombok.Data;


@Data
public class BadgeDTO {


    private String name;         // e.g., "Transport Pro"
    private String type;         // e.g., "transport"
    private String iconName;     // e.g., "Car"
    private String description;  // e.g., "Reduced emissions by 50%"
    private String color;        // e.g., "bg-blue-500"
    private String bgColor;      // e.g., "bg-blue-100"

    // UI specific fields
    private boolean earned;      // true if user has this badge
    private String date;         // e.g., "Jan 5, 2026"

}
