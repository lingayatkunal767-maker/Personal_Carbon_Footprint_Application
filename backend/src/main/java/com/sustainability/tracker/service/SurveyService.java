package com.sustainability.tracker.service;

import com.sustainability.tracker.dto.SurveyRequest;
import com.sustainability.tracker.dto.SurveyResponse;
import com.sustainability.tracker.entity.CarbonLog;
import com.sustainability.tracker.entity.LifestyleSurvey;
import com.sustainability.tracker.exception.UserNotFoundException;
import com.sustainability.tracker.repository.LifestyleSurveyRepository;
import com.sustainability.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class SurveyService {

    private final LifestyleSurveyRepository surveyRepository;
    private final CarbonCalculationService carbonCalculationService;
    private final BehaviorDatasetService behaviorDatasetService;
    private final UserRepository userRepository;
    private final BadgeEarningService badgeEarningService;
    private final GoalService goalService;

    public SurveyResponse processSurvey(SurveyRequest request) {
        Long userId = request.getUserId();

        // Check if user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        LifestyleSurvey survey = mapToEntity(request, userId);
        survey = surveyRepository.save(survey);

        CarbonLog carbonLog = carbonCalculationService.calculateAndLogEmissions(survey);
        BehaviorDatasetService.BehaviorPrediction prediction = behaviorDatasetService.predict(
            buildBehaviorProfile(request, survey)
        );
        BigDecimal customizedTotal = blendEmission(carbonLog.getTotalEmission(), prediction.predictedFootprint());
        String impactLevel = Optional.ofNullable(prediction.impactLevel())
            .filter(level -> !level.isBlank())
            .orElse(classifyImpact(customizedTotal));

        // Update goal progress based on new carbon log
        goalService.updateGoalProgress(userId);

        // Check and award badges after logging carbon footprint
        badgeEarningService.checkAndAwardBadges(userId);

        return new SurveyResponse(
                survey.getId(),
                carbonLog.getLogDate(),
                carbonLog.getTransportEmission(),
                carbonLog.getFoodEmission(),
                carbonLog.getEnergyEmission(),
                carbonLog.getTotalEmission(),
                customizedTotal,
                prediction.predictedFootprint(),
                impactLevel,
                prediction.matchedSamples(),
                prediction.datasetConnected()
        );
    }

    private LifestyleSurvey mapToEntity(SurveyRequest request, Long userId) {
        LifestyleSurvey survey = new LifestyleSurvey();
        survey.setUserId(userId);
        survey.setSurveyDate(Optional.ofNullable(request.getSurveyDate()).orElse(LocalDate.now()));
        survey.setTransportMode(request.getTransportMode());
        survey.setDistanceKmPerDay(request.getDistanceKmPerDay());
        survey.setFuelType(request.getFuelType());
        survey.setMealsNonVegPerWeek(request.getMealsNonVegPerWeek());
        survey.setMealsVegPerWeek(request.getMealsVegPerWeek());
        survey.setElectricityKwhPerMonth(request.getElectricityKwhPerMonth());
        survey.setCookingGasCylindersPerMonth(request.getCookingGasCylindersPerMonth());
        return survey;
    }

    private BehaviorDatasetService.BehaviorProfile buildBehaviorProfile(SurveyRequest request, LifestyleSurvey survey) {
        LocalDate surveyDate = Optional.ofNullable(survey.getSurveyDate()).orElse(LocalDate.now());
        BigDecimal dailyElectricity = Optional.ofNullable(request.getElectricityKwhPerMonth())
                .orElse(BigDecimal.ZERO)
                .divide(new BigDecimal("30"), 2, RoundingMode.HALF_UP);

        return new BehaviorDatasetService.BehaviorProfile(
                resolveDayType(surveyDate),
                resolveTransportMode(request),
                Optional.ofNullable(request.getDistanceKmPerDay()).orElse(BigDecimal.ZERO),
                dailyElectricity,
                resolveRenewableUsagePct(request),
                resolveFoodType(request),
                Optional.ofNullable(request.getScreenTimeHours()).orElse(new BigDecimal("5.0")),
                Optional.ofNullable(request.getWasteGeneratedKg()).orElse(new BigDecimal("0.8")),
                Optional.ofNullable(request.getEcoActions()).orElse(1)
        );
    }

    private String resolveDayType(LocalDate surveyDate) {
        DayOfWeek day = surveyDate.getDayOfWeek();
        return (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) ? "Weekend" : "Weekday";
    }

    private String resolveTransportMode(SurveyRequest request) {
        if (request.getTransportMode() == null) {
            return "Car";
        }

        if (request.getTransportMode() == LifestyleSurvey.TransportMode.CAR
                && request.getFuelType() == LifestyleSurvey.FuelType.EV) {
            return "EV";
        }

        return switch (request.getTransportMode()) {
            case CAR -> "Car";
            case BUS, TRAIN, METRO, AUTO -> "Bus";
            case BIKE -> "Bike";
            case WALK -> "Walk";
        };
    }

    private String resolveFoodType(SurveyRequest request) {
        int nonVegMeals = Optional.ofNullable(request.getMealsNonVegPerWeek()).orElse(0);
        int vegMeals = Optional.ofNullable(request.getMealsVegPerWeek()).orElse(0);

        if (nonVegMeals == 0 && vegMeals > 0) {
            return "Veg";
        }
        if (nonVegMeals > vegMeals) {
            return "Non-Veg";
        }
        return "Mixed";
    }

    private BigDecimal resolveRenewableUsagePct(SurveyRequest request) {
        if (request.getRenewableUsagePct() != null) {
            return request.getRenewableUsagePct();
        }
        if (request.getFuelType() == LifestyleSurvey.FuelType.EV) {
            return new BigDecimal("75");
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal blendEmission(BigDecimal formulaEmission, BigDecimal datasetPrediction) {
        BigDecimal safeFormulaEmission = Optional.ofNullable(formulaEmission).orElse(BigDecimal.ZERO);
        if (datasetPrediction == null) {
            return safeFormulaEmission.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal datasetWeight = behaviorDatasetService.getBlendWeight();
        BigDecimal formulaWeight = BigDecimal.ONE.subtract(datasetWeight);
        return safeFormulaEmission.multiply(formulaWeight)
                .add(datasetPrediction.multiply(datasetWeight))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private String classifyImpact(BigDecimal emission) {
        if (emission == null) {
            return "Medium";
        }
        if (emission.compareTo(new BigDecimal("6.00")) <= 0) {
            return "Low";
        }
        if (emission.compareTo(new BigDecimal("10.00")) <= 0) {
            return "Medium";
        }
        return "High";
    }
}
