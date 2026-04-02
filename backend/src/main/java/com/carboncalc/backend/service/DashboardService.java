package com.carboncalc.backend.service;

import com.carboncalc.backend.dto.DashboardResponse;
import com.carboncalc.backend.dto.SurveyResponse;
import com.carboncalc.backend.entity.Survey;
import com.carboncalc.backend.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SurveyRepository surveyRepository;

    public DashboardResponse getDashboardData(Long userId) {
        List<Survey> surveys = surveyRepository.findByUserIdOrderByDateDesc(userId);

        if (surveys.isEmpty()) {
            return DashboardResponse.builder()
                .totalCarbon(0.0).averageCarbon(0.0).surveyCount(0)
                .totalTransportEmission(0.0).totalFoodEmission(0.0).totalEnergyEmission(0.0)
                .latestSurvey(null).build();
        }

        double total      = surveys.stream().mapToDouble(s -> s.getCarbonScore() != null ? s.getCarbonScore() : 0).sum();
        double transport  = surveys.stream().mapToDouble(s -> s.getTransportEmission() != null ? s.getTransportEmission() : 0).sum();
        double food       = surveys.stream().mapToDouble(s -> s.getFoodEmission() != null ? s.getFoodEmission() : 0).sum();
        double energy     = surveys.stream().mapToDouble(s -> s.getEnergyEmission() != null ? s.getEnergyEmission() : 0).sum();
        double avg        = Math.round((total / surveys.size()) * 100.0) / 100.0;

        return DashboardResponse.builder()
            .totalCarbon(Math.round(total * 100.0) / 100.0)
            .averageCarbon(avg)
            .surveyCount(surveys.size())
            .totalTransportEmission(Math.round(transport * 100.0) / 100.0)
            .totalFoodEmission(Math.round(food * 100.0) / 100.0)
            .totalEnergyEmission(Math.round(energy * 100.0) / 100.0)
            .latestSurvey(toDto(surveys.get(0)))
            .build();
    }

    private SurveyResponse toDto(Survey s) {
        return SurveyResponse.builder()
            .id(s.getId())
            .transport(s.getTransport())
            .distanceKm(s.getDistanceKm())
            .fuelType(s.getFuelType())
            .food(s.getFood())
            .mealsPerDay(s.getMealsPerDay())
            .eatingOutFrequency(s.getEatingOutFrequency())
            .energy(s.getEnergy())
            .renewableEnergy(s.getRenewableEnergy())
            .transportEmission(s.getTransportEmission())
            .foodEmission(s.getFoodEmission())
            .energyEmission(s.getEnergyEmission())
            .carbonScore(s.getCarbonScore())
            .date(s.getDate())
            .build();
    }
}
