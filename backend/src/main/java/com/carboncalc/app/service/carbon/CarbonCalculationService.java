package com.carboncalc.app.service.carbon;

import com.carboncalc.app.dto.carbon.CarbonCalculationResponse;
import com.carboncalc.app.dto.survey.SurveyRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CarbonCalculationService {

    private final EmissionRuleService emissionRuleService;

    public CarbonCalculationResponse calculateFromSurvey(SurveyRequest request) {
        double distance = request.getDistancePerDay() == null ? 0.0 : request.getDistancePerDay();
        int meals = request.getMealsPerDay() == null ? 1 : request.getMealsPerDay();

        double transportEmission = distance *
                emissionRuleService.transportFactor(request.getTransportMode(), request.getFuelType());

        double foodEmission =
                (meals * emissionRuleService.dietFactor(request.getDietType())) +
                        emissionRuleService.eatingOutFactor(request.getEatingOutFrequency());

        double energyEmission =
                emissionRuleService.energyFactor(
                        request.getMonthlyElectricityUsage(),
                        request.getRenewableEnergyUsage()
                );

        double totalEmission = transportEmission + foodEmission + energyEmission;

        return CarbonCalculationResponse.builder()
                .transportEmission(round(transportEmission))
                .foodEmission(round(foodEmission))
                .energyEmission(round(energyEmission))
                .totalEmission(round(totalEmission))
                .build();
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}