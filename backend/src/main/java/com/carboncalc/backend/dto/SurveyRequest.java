package com.carboncalc.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyRequest {

    @NotBlank(message = "Transport mode is required")
    @Pattern(regexp = "^(car|bus|bike|walk|wfh|public_transport)$",
             message = "Transport must be one of: car, bus, bike, walk, wfh, public_transport")
    private String transport;

    @Min(value = 0, message = "Distance must be non-negative")
    private Double distanceKm;

    private String fuelType;

    @NotBlank(message = "Food type is required")
    @Pattern(regexp = "^(vegetarian|non-vegetarian|vegan)$",
             message = "Food must be one of: vegetarian, non-vegetarian, vegan")
    private String food;

    @Min(value = 1, message = "Meals per day must be at least 1")
    @Max(value = 10, message = "Meals per day must be at most 10")
    private Integer mealsPerDay;

    private String eatingOutFrequency;

    @NotNull(message = "Energy consumption is required")
    @Min(value = 0, message = "Energy consumption must be non-negative")
    private Double energy;

    private Boolean renewableEnergy;
}
