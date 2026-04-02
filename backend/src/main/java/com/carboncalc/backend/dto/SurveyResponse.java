package com.carboncalc.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyResponse {

    private Long id;
    private String transport;
    private Double distanceKm;
    private String fuelType;
    private String food;
    private Integer mealsPerDay;
    private String eatingOutFrequency;
    private Double energy;
    private Boolean renewableEnergy;
    private Double transportEmission;
    private Double foodEmission;
    private Double energyEmission;
    private Double carbonScore;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime date;
}
