package com.carbon.carbon.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SurveyRequest {

    @NotBlank
    private String transportMode;

    @Min(0)
    private double distance;

    private String fuelType;

    @NotBlank
    private String dietType;

    @Min(1)
    private int mealsPerDay;

    @Min(0)
    private double monthlyKwh;

    @NotNull
    private Boolean renewable;

    // Getters & Setters
}