package com.carboncalc.app.service.survey;

import com.carboncalc.app.dto.carbon.CarbonCalculationResponse;
import com.carboncalc.app.dto.survey.SurveyRequest;
import com.carboncalc.app.dto.survey.SurveyResponse;
import com.carboncalc.app.entity.Survey;
import com.carboncalc.app.entity.User;
import com.carboncalc.app.repository.SurveyRepository;
import com.carboncalc.app.service.carbon.CarbonCalculationService;
import com.carboncalc.app.service.carbon.CarbonLogService;
import com.carboncalc.app.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SurveyService {

    private final SurveyRepository surveyRepository;
    private final UserService userService;
    private final CarbonCalculationService carbonCalculationService;
    private final CarbonLogService carbonLogService;

    public SurveyResponse submitSurvey(Long userId, SurveyRequest request) {
        User user = userService.getUserEntity(userId);

        Survey survey = Survey.builder()
                .user(user)
                .transportMode(request.getTransportMode())
                .fuelType(request.getFuelType())
                .distancePerDay(request.getDistancePerDay())
                .dietType(request.getDietType())
                .eatingOutFrequency(request.getEatingOutFrequency())
                .mealsPerDay(request.getMealsPerDay())
                .monthlyElectricityUsage(request.getMonthlyElectricityUsage())
                .renewableEnergyUsage(request.getRenewableEnergyUsage())
                .createdAt(LocalDateTime.now())
                .build();

        survey = surveyRepository.save(survey);

        CarbonCalculationResponse calc = carbonCalculationService.calculateFromSurvey(request);
        carbonLogService.createCarbonLog(user, calc);

        return SurveyResponse.builder()
                .id(survey.getId())
                .message("Survey submitted successfully")
                .build();
    }
}