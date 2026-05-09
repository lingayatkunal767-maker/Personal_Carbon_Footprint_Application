package com.carboncalc.app.service.carbon;

import com.carboncalc.app.enums.*;
import org.springframework.stereotype.Service;

@Service
public class EmissionRuleService {

    public double transportFactor(TransportMode mode, FuelType fuelType) {
        if (mode == null) return 0.0;

        return switch (mode) {
            case WALKING, BICYCLE -> 0.0;
            case BUS -> 0.08;
            case TRAIN, METRO -> 0.05;
            case BIKE -> fuelType == FuelType.ELECTRIC ? 0.03 : 0.07;
            case CAR, CAB -> {
                if (fuelType == FuelType.ELECTRIC) yield 0.04;
                if (fuelType == FuelType.HYBRID) yield 0.09;
                if (fuelType == FuelType.CNG) yield 0.10;
                if (fuelType == FuelType.DIESEL) yield 0.17;
                yield 0.15;
            }
        };
    }

    public double dietFactor(DietType dietType) {
        if (dietType == null) return 0.0;

        return switch (dietType) {
            case VEGAN -> 1.5;
            case VEGETARIAN -> 2.0;
            case EGGETARIAN -> 2.4;
            case NON_VEGETARIAN -> 3.5;
        };
    }

    public double eatingOutFactor(EatingOutFrequency frequency) {
        if (frequency == null) return 0.0;

        return switch (frequency) {
            case NEVER -> 0.0;
            case RARELY -> 0.3;
            case WEEKLY -> 0.8;
            case FREQUENTLY -> 1.5;
            case DAILY -> 2.5;
        };
    }

    public double energyFactor(Double monthlyElectricityUsage, Boolean renewableEnergyUsage) {
        double units = monthlyElectricityUsage == null ? 0.0 : monthlyElectricityUsage;
        double factor = Boolean.TRUE.equals(renewableEnergyUsage) ? 0.35 : 0.82;
        return units * factor / 30.0;
    }
}