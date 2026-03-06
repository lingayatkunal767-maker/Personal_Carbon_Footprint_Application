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

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class SurveyService {

    private final LifestyleSurveyRepository surveyRepository;
    private final CarbonCalculationService carbonCalculationService;
    private final UserRepository userRepository;

    public SurveyResponse processSurvey(SurveyRequest request) {
        Long userId = request.getUserId();

        // Check if user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        LifestyleSurvey survey = mapToEntity(request, userId);
        survey = surveyRepository.save(survey);

        CarbonLog carbonLog = carbonCalculationService.calculateAndLogEmissions(survey);

        return new SurveyResponse(
                survey.getId(),
                carbonLog.getLogDate(),
                carbonLog.getTransportEmission(),
                carbonLog.getFoodEmission(),
                carbonLog.getEnergyEmission(),
                carbonLog.getTotalEmission()
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
}
