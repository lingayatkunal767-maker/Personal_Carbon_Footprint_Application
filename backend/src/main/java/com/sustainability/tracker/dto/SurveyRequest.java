package com.sustainability.tracker.dto;

import com.sustainability.tracker.entity.LifestyleSurvey.FuelType;
import com.sustainability.tracker.entity.LifestyleSurvey.TransportMode;
import com.sustainability.tracker.validation.ValidFuelType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@ValidFuelType
public class SurveyRequest {

    // This would be taken from SecurityContext in a real app
    @NotNull(message = "User ID is required.")
    private Long userId;

    private LocalDate surveyDate; // Optional, defaults to today if not provided

    @NotNull(message = "Transport mode is required.")
    private TransportMode transportMode;

    @NotNull(message = "Distance per day is required.")
    @DecimalMin(value = "0.0", message = "Distance must be non-negative.")
    private BigDecimal distanceKmPerDay;

    @NotNull(message = "Fuel type is required.")
    private FuelType fuelType;

    @Min(value = 0, message = "Meals must be non-negative.")
    @Max(value = 21, message = "Meals cannot exceed 21 per week.")
    private Integer mealsNonVegPerWeek = 0;

    @Min(value = 0, message = "Meals must be non-negative.")
    @Max(value = 21, message = "Meals cannot exceed 21 per week.")
    private Integer mealsVegPerWeek = 0;

    @NotNull(message = "Electricity usage is required.")
    @DecimalMin(value = "0.0", message = "Electricity usage must be non-negative.")
    private BigDecimal electricityKwhPerMonth;

    @DecimalMin(value = "0.0", message = "Cooking gas usage must be non-negative.")
    private BigDecimal cookingGasCylindersPerMonth;
}
