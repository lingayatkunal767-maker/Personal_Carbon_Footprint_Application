package com.carboncalc.backend.service;

import com.carboncalc.backend.dto.SurveyRequest;
import com.carboncalc.backend.entity.CarbonLog;
import com.carboncalc.backend.entity.Survey;
import com.carboncalc.backend.entity.User;
import com.carboncalc.backend.repository.CarbonLogRepository;
import com.carboncalc.backend.repository.SurveyRepository;
import com.carboncalc.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class SurveyService {

    private final SurveyRepository surveyRepository;
    private final UserRepository userRepository;
    private final CarbonCalculatorService calc;
    private final BadgeService badgeService;
    private final GoalService goalService;
    private final LeaderboardService leaderboardService;
    private final CarbonLogRepository carbonLogRepository;
    private final NotificationService notificationService;

    private static final double HIGH_EMISSION_THRESHOLD = 15.0; // kg CO2/day

    @Autowired
    public SurveyService(SurveyRepository surveyRepository,
                         UserRepository userRepository,
                         CarbonCalculatorService calc,
                         CarbonLogRepository carbonLogRepository,
                         NotificationService notificationService,
                         @Lazy BadgeService badgeService,
                         @Lazy GoalService goalService,
                         @Lazy LeaderboardService leaderboardService) {
        this.surveyRepository = surveyRepository;
        this.userRepository = userRepository;
        this.calc = calc;
        this.carbonLogRepository = carbonLogRepository;
        this.notificationService = notificationService;
        this.badgeService = badgeService;
        this.goalService = goalService;
        this.leaderboardService = leaderboardService;
    }

    @Transactional
    public Survey submitSurvey(SurveyRequest req, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        double transportEmission = calc.round2(calc.calculateTransportEmission(
            req.getTransport(), req.getDistanceKm(), req.getFuelType()));
        double foodEmission = calc.round2(calc.calculateFoodEmission(
            req.getFood(), req.getMealsPerDay(), req.getEatingOutFrequency()));
        double energyEmission = calc.round2(calc.calculateEnergyEmission(
            req.getEnergy(), req.getRenewableEnergy()));
        double total = calc.calculateTotal(transportEmission, foodEmission, energyEmission);

        Survey survey = Survey.builder()
            .transport(req.getTransport())
            .distanceKm(req.getDistanceKm())
            .fuelType(req.getFuelType())
            .food(req.getFood())
            .mealsPerDay(req.getMealsPerDay())
            .eatingOutFrequency(req.getEatingOutFrequency())
            .energy(req.getEnergy())
            .renewableEnergy(req.getRenewableEnergy())
            .transportEmission(transportEmission)
            .foodEmission(foodEmission)
            .energyEmission(energyEmission)
            .carbonScore(total)
            .date(LocalDateTime.now(ZoneOffset.UTC))
            .user(user)
            .build();

        Survey saved = surveyRepository.save(survey);

        // Save to carbon_logs table
        carbonLogRepository.save(CarbonLog.builder()
            .user(user)
            .date(saved.getDate().toLocalDate())
            .transportEmission(transportEmission)
            .foodEmission(foodEmission)
            .energyEmission(energyEmission)
            .totalEmission(total)
            .build());

        // Milestone 3: refresh goals, badges, leaderboard after each survey
        goalService.refreshGoalsForUser(userId);
        badgeService.evaluateBadges(userId);
        leaderboardService.refreshLeaderboard(userId);

        // Survey submitted notification
        notificationService.push(userId,
            "Survey Submitted 📋",
            "Your carbon footprint for this entry is " + total + " kg CO₂ (Transport: " +
            transportEmission + ", Food: " + foodEmission + ", Energy: " + energyEmission + " kg).",
            "SURVEY");

        // Milestone 4: high emission alert
        if (total > HIGH_EMISSION_THRESHOLD) {
            notificationService.push(userId,
                "High Emission Alert ⚠️",
                "Your latest survey recorded " + total + " kg CO₂. Consider reducing transport or energy usage.",
                "HIGH_EMISSION");
        }

        return saved;
    }

    public List<Survey> getUserSurveys(Long userId) {
        return surveyRepository.findByUserIdOrderByDateDesc(userId);
    }
}
