package com.carbon.carbon.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CarbonCalculationService {

    private static final double PETROL_CAR_FACTOR = 0.21;  // kg CO2 per km
    private static final double DIESEL_CAR_FACTOR = 0.25;
    private static final double ELECTRIC_CAR_FACTOR = 0.12;
    private static final double HYBRID_CAR_FACTOR = 0.15;

    private static final double BIKE_FACTOR = 0.10;
    private static final double PUBLIC_TRANSPORT_FACTOR = 0.05;
    private static final double WALK_FACTOR = 0.0;
    private static final double WFH_FACTOR = 0.02;

    private static final double VEG_FACTOR = 1.5;
    private static final double NON_VEG_FACTOR = 3.0;
    private static final double VEGAN_FACTOR = 1.0;

    private static final double ELECTRICITY_FACTOR = 0.7; // per kWh
    private static final double RENEWABLE_REDUCTION = 0.4; // 40% reduction

    public double calculateTransport(String mode,
                                     Double distance,
                                     String fuelType) {
        if (distance == null) return 0.0;

        double factor = 0;

        switch (mode.toLowerCase()) {
            case "car":
                factor = getCarFuelFactor(fuelType);
                break;
            case "bike":
            case "bicycle":
                factor = BIKE_FACTOR;
                break;
            case "public transport":
            case "public transit":
                factor = PUBLIC_TRANSPORT_FACTOR;
                break;
            case "walk":
                factor = WALK_FACTOR;
                break;
            case "wfh":
                factor = WFH_FACTOR;
                break;
            default:
                factor = 0.0;
        }

        return distance * factor;
    }

    private double getCarFuelFactor(String fuelType) {
        if (fuelType == null) return PETROL_CAR_FACTOR;

        switch (fuelType.toLowerCase()) {
            case "diesel":
                return DIESEL_CAR_FACTOR;
            case "electric":
                return ELECTRIC_CAR_FACTOR;
            case "hybrid":
                return HYBRID_CAR_FACTOR;
            default:
                return PETROL_CAR_FACTOR;
        }
    }

    public double calculateFood(String dietType, int mealsPerDay) {

        double base = 0;

        switch (dietType.toLowerCase()) {
            case "non-vegetarian":
            case "regular meat eater":
            case "high meat consumption":
            case "mixed (occasional meat)":
                base = NON_VEG_FACTOR;
                break;
            case "vegetarian":
            case "pescatarian":
                base = VEG_FACTOR;
                break;
            case "vegan":
                base = VEGAN_FACTOR;
                break;
            default:
                base = VEG_FACTOR; // Default to vegetarian if unknown
        }

        return base * mealsPerDay;
    }

    public double calculateEnergy(Double monthlyKwh,
                                  boolean renewable) {
        if (monthlyKwh == null) return 0.0;

        double emission = monthlyKwh * ELECTRICITY_FACTOR;

        if (renewable) {
            emission = emission * (1 - RENEWABLE_REDUCTION);
        }

        return emission;
    }

    public double calculateTotal(double t, double f, double e) {
        return t + f + e;
    }
}