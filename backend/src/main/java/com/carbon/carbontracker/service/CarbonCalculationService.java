package com.carbon.carbontracker.service;

import org.springframework.stereotype.Service;
import com.carbon.carbontracker.dto.SurveyRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CarbonCalculationService {

    private final AdminSettingsStoreService settingsStoreService;

    public double calculateTransport(SurveyRequest request) {

        if (request.getTransportMode() == null) {
            return 0;
        }

        double factor = 0;
        final double configuredTransportFactor = settingsStoreService.getDouble("transportFactor", 0.12);

        switch (request.getTransportMode().toUpperCase()) {

            case "CAR":
                String fuel = request.getFuelType();

                if ("PETROL".equalsIgnoreCase(fuel)) factor = 0.21;
                else if ("DIESEL".equalsIgnoreCase(fuel)) factor = 0.18;
                else if ("ELECTRIC".equalsIgnoreCase(fuel)) factor = 0.05;
                else factor = 0.15;
                break;

            case "PUBLIC":
                factor = configuredTransportFactor;
                break;

            case "BIKE":
                factor = Math.max(0.0, configuredTransportFactor * 0.2);
                break;

            case "WALK":
            case "WFH":
                factor = 0;
                break;

            default:
                factor = 0;
        }

        Double distance = request.getDistancePerDay();
        return (distance == null ? 0 : distance) * factor;
    }

    public double calculateFood(SurveyRequest request) {

        if (request.getDietType() == null) {
            return 0;
        }

        double base = 0;

        final double vegFactor = settingsStoreService.getDouble("foodVegFactor", 1.5);
        final double nonVegFactor = settingsStoreService.getDouble("foodNonVegFactor", 3.3);
        final double dairyFactor = settingsStoreService.getDouble("foodDairyFactor", 2.1);

        switch (request.getDietType().toUpperCase()) {
            case "VEG": base = vegFactor; break;
            case "NON_VEG": base = nonVegFactor; break;
            case "VEGAN": base = Math.max(0.0, vegFactor * 0.8); break;
            case "DAIRY": base = dairyFactor; break;
            default: base = 0;
        }

        Integer meals = request.getMealsPerDay();
        return base * (meals == null ? 0 : meals);
    }

    public double calculateEnergy(SurveyRequest request) {

        Double electricity = request.getMonthlyElectricity();
        if (electricity == null) {
            return 0;
        }

        final double electricityFactor = settingsStoreService.getDouble("electricityFactor", 0.82);
        double emission = electricity * electricityFactor;

        if (Boolean.TRUE.equals(request.getRenewable())) {
            emission *= 0.6;
        }

        return emission;
    }
}