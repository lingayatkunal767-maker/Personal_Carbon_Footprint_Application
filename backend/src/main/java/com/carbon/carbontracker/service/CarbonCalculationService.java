package com.carbon.carbontracker.service;

import org.springframework.stereotype.Service;
import com.carbon.carbontracker.dto.SurveyRequest;

@Service
public class CarbonCalculationService {

    public double calculateTransport(SurveyRequest request) {

        if (request.getTransportMode() == null) {
            return 0;
        }

        double factor = 0;

        switch (request.getTransportMode().toUpperCase()) {

            case "CAR":
                String fuel = request.getFuelType();

                if ("PETROL".equalsIgnoreCase(fuel)) factor = 0.21;
                else if ("DIESEL".equalsIgnoreCase(fuel)) factor = 0.18;
                else if ("ELECTRIC".equalsIgnoreCase(fuel)) factor = 0.05;
                else factor = 0.15;
                break;

            case "PUBLIC":
                factor = 0.1;
                break;

            case "BIKE":
                factor = 0.02;
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

        switch (request.getDietType().toUpperCase()) {
            case "VEG": base = 2; break;
            case "NON_VEG": base = 5; break;
            case "VEGAN": base = 1.5; break;
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

        double emission = electricity * 0.82;

        if (Boolean.TRUE.equals(request.getRenewable())) {
            emission *= 0.6;
        }

        return emission;
    }
}