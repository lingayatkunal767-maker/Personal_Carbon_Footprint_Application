package com.carboncalc.backend.service;

import org.springframework.stereotype.Service;

@Service
public class CarbonCalculatorService {

    // Transport emission factors (kg CO2 per day)
    private static final double CAR_PETROL_PER_KM    = 0.21;
    private static final double CAR_DIESEL_PER_KM    = 0.17;
    private static final double CAR_ELECTRIC_PER_KM  = 0.05;
    private static final double CAR_HYBRID_PER_KM    = 0.11;
    private static final double CAR_DEFAULT_PER_KM   = 0.21;
    private static final double BUS_PER_KM           = 0.089;
    private static final double PUBLIC_PER_KM        = 0.089;
    private static final double BIKE_PER_KM          = 0.0;
    private static final double WALK_PER_KM          = 0.0;
    private static final double WFH_DAILY            = 0.0;
    private static final double DEFAULT_DISTANCE_KM  = 10.0;

    // Food emission factors (kg CO2 per day)
    private static final double VEGAN_BASE           = 1.0;
    private static final double VEGETARIAN_BASE      = 1.5;
    private static final double NON_VEG_BASE         = 3.0;
    private static final double MEALS_FACTOR         = 0.2;
    private static final double DEFAULT_MEALS        = 3;

    // Eating out multipliers
    private static final double EATING_OUT_NEVER     = 0.0;
    private static final double EATING_OUT_RARELY    = 0.3;
    private static final double EATING_OUT_SOMETIMES = 0.6;
    private static final double EATING_OUT_OFTEN     = 1.0;
    private static final double EATING_OUT_DAILY     = 1.5;

    // Energy: grid emission factor (kg CO2 per kWh), monthly -> daily
    private static final double GRID_FACTOR          = 0.5;
    private static final double RENEWABLE_DISCOUNT   = 0.3;
    private static final double DAYS_PER_MONTH       = 30.0;

    public double calculateTransportEmission(String transport, Double distanceKm, String fuelType) {
        double distance = (distanceKm != null && distanceKm > 0) ? distanceKm : DEFAULT_DISTANCE_KM;
        return switch (transport.toLowerCase()) {
            case "car" -> distance * getCarFactor(fuelType);
            case "bus", "public_transport" -> distance * BUS_PER_KM;
            case "bike", "walk" -> BIKE_PER_KM;
            case "wfh" -> WFH_DAILY;
            default -> distance * CAR_DEFAULT_PER_KM;
        };
    }

    public double calculateFoodEmission(String food, Integer mealsPerDay, String eatingOutFrequency) {
        double base = switch (food.toLowerCase()) {
            case "vegan" -> VEGAN_BASE;
            case "vegetarian" -> VEGETARIAN_BASE;
            case "non-vegetarian" -> NON_VEG_BASE;
            default -> VEGETARIAN_BASE;
        };
        int meals = (mealsPerDay != null) ? mealsPerDay : (int) DEFAULT_MEALS;
        double mealAdj = (meals - DEFAULT_MEALS) * MEALS_FACTOR;
        double eatOutAdj = getEatingOutFactor(eatingOutFrequency);
        return Math.max(0, base + mealAdj + eatOutAdj);
    }

    public double calculateEnergyEmission(Double monthlyKwh, Boolean renewable) {
        double dailyKwh = monthlyKwh / DAYS_PER_MONTH;
        double factor = (renewable != null && renewable) ? GRID_FACTOR * (1 - RENEWABLE_DISCOUNT) : GRID_FACTOR;
        return dailyKwh * factor;
    }

    public double calculateTotal(double transport, double food, double energy) {
        return round2(transport + food + energy);
    }

    private double getCarFactor(String fuelType) {
        if (fuelType == null) return CAR_DEFAULT_PER_KM;
        return switch (fuelType.toLowerCase()) {
            case "diesel"   -> CAR_DIESEL_PER_KM;
            case "electric" -> CAR_ELECTRIC_PER_KM;
            case "hybrid"   -> CAR_HYBRID_PER_KM;
            default         -> CAR_PETROL_PER_KM;
        };
    }

    private double getEatingOutFactor(String freq) {
        if (freq == null) return 0.0;
        return switch (freq.toLowerCase()) {
            case "rarely"    -> EATING_OUT_RARELY;
            case "sometimes" -> EATING_OUT_SOMETIMES;
            case "often"     -> EATING_OUT_OFTEN;
            case "daily"     -> EATING_OUT_DAILY;
            default          -> EATING_OUT_NEVER;
        };
    }

    public double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
