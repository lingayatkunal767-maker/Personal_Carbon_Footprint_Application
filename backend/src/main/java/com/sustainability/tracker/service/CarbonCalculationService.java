package com.sustainability.tracker.service;

import com.sustainability.tracker.entity.CarbonLog;
import com.sustainability.tracker.entity.LifestyleSurvey;
import com.sustainability.tracker.repository.CarbonLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Transactional
public class CarbonCalculationService {

    private final CarbonLogRepository carbonLogRepository;

    // Transport factors
    @Value("${carbon.emission.factor.transport.car}")
    private BigDecimal carFactor;
    @Value("${carbon.emission.factor.transport.bus}")
    private BigDecimal busFactor;
    @Value("${carbon.emission.factor.transport.train}")
    private BigDecimal trainFactor;
    @Value("${carbon.emission.factor.transport.auto}")
    private BigDecimal autoFactor;
    @Value("${carbon.emission.factor.transport.ev_car}")
    private BigDecimal evCarFactor;

    // Food factors
    @Value("${carbon.emission.factor.food.non_veg}")
    private BigDecimal nonVegFactor;
    @Value("${carbon.emission.factor.food.veg}")
    private BigDecimal vegFactor;

    // Energy factors
    @Value("${carbon.emission.factor.energy.electricity}")
    private BigDecimal electricityFactor;
    @Value("${carbon.emission.factor.energy.lpg_cylinder}")
    private BigDecimal lpgCylinderFactor;

    private static final BigDecimal DAYS_IN_WEEK = new BigDecimal("7");
    private static final BigDecimal DAYS_IN_MONTH = new BigDecimal("30");

    public CarbonLog calculateAndLogEmissions(LifestyleSurvey survey) {
        BigDecimal transportEmission = calculateTransportEmissions(survey);
        BigDecimal foodEmission = calculateFoodEmissions(survey);
        BigDecimal energyEmission = calculateEnergyEmissions(survey);

        BigDecimal totalEmission = transportEmission.add(foodEmission).add(energyEmission);

        CarbonLog carbonLog = carbonLogRepository.findByUserIdAndLogDate(survey.getUserId(), survey.getSurveyDate())
                .orElse(new CarbonLog());

        carbonLog.setUserId(survey.getUserId());
        carbonLog.setLogDate(survey.getSurveyDate());
        carbonLog.setTransportEmission(transportEmission);
        carbonLog.setFoodEmission(foodEmission);
        carbonLog.setEnergyEmission(energyEmission);
        carbonLog.setTotalEmission(totalEmission);

        return carbonLogRepository.save(carbonLog);
    }

    private BigDecimal calculateTransportEmissions(LifestyleSurvey survey) {
        BigDecimal factor = BigDecimal.ZERO;
        switch (survey.getTransportMode()) {
            case CAR:
                factor = survey.getFuelType() == LifestyleSurvey.FuelType.EV ? evCarFactor : carFactor;
                break;
            case BUS:
                factor = busFactor;
                break;
            case TRAIN:
            case METRO:
                factor = trainFactor;
                break;
            case AUTO:
                factor = autoFactor;
                break;
            case BIKE:
            case WALK:
                factor = BigDecimal.ZERO;
                break;
        }
        return survey.getDistanceKmPerDay().multiply(factor).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateFoodEmissions(LifestyleSurvey survey) {
        BigDecimal nonVegEmissions = new BigDecimal(survey.getMealsNonVegPerWeek()).multiply(nonVegFactor);
        BigDecimal vegEmissions = new BigDecimal(survey.getMealsVegPerWeek()).multiply(vegFactor);
        return nonVegEmissions.add(vegEmissions).divide(DAYS_IN_WEEK, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateEnergyEmissions(LifestyleSurvey survey) {
        BigDecimal dailyElectricityKwh = survey.getElectricityKwhPerMonth().divide(DAYS_IN_MONTH, 4, RoundingMode.HALF_UP);
        BigDecimal electricityEmission = dailyElectricityKwh.multiply(electricityFactor);

        BigDecimal lpgEmission = BigDecimal.ZERO;
        if (survey.getCookingGasCylindersPerMonth() != null && survey.getCookingGasCylindersPerMonth().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal dailyLpgCylinders = survey.getCookingGasCylindersPerMonth().divide(DAYS_IN_MONTH, 4, RoundingMode.HALF_UP);
            lpgEmission = dailyLpgCylinders.multiply(lpgCylinderFactor);
        }

        return electricityEmission.add(lpgEmission).setScale(2, RoundingMode.HALF_UP);
    }
}
