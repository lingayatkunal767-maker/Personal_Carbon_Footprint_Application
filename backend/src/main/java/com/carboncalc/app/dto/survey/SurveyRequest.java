package com.carboncalc.app.dto.survey;

import com.carboncalc.app.enums.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyRequest {

    private TransportMode transportMode;
    private FuelType fuelType;
    private Double distancePerDay;
    private DietType dietType;
    private EatingOutFrequency eatingOutFrequency;
    private Integer mealsPerDay;
    private Double monthlyElectricityUsage;
    private Boolean renewableEnergyUsage;
}