package com.carbon.carbon.service;

import com.carbon.carbon.dto.SurveyRequest;
import com.carbon.carbon.dto.SurveyResponse;
import com.carbon.carbon.entity.Survey;
import com.carbon.carbon.entity.User;
import com.carbon.carbon.repository.SurveyRepository;
import org.springframework.stereotype.Service;

@Service
public class SurveyService {

    private final SurveyRepository surveyRepository;
    private final CarbonCalculationService calculationService;
    private final CarbonLogService carbonLogService;

    public SurveyService(SurveyRepository surveyRepository,
                         CarbonCalculationService calculationService,
                         CarbonLogService carbonLogService) {
        this.surveyRepository = surveyRepository;
        this.calculationService = calculationService;
        this.carbonLogService = carbonLogService;
    }

    public SurveyResponse processSurvey(User user, SurveyRequest request) {

        double transport = calculationService.calculateTransport(
                request.getTransportMode(),
                request.getDistance(),
                request.getFuelType()
        );

        double food = calculationService.calculateFood(
                request.getDietType(),
                request.getMealsPerDay()
        );

        double energy = calculationService.calculateEnergy(
                request.getMonthlyKwh(),
                request.getRenewable()
        );

        double total = calculationService.calculateTotal(transport, food, energy);

        Survey survey = new Survey();
        survey.setUser(user);
        survey.setTransportMode(request.getTransportMode());
        survey.setDistance(request.getDistance());
        survey.setFuelType(request.getFuelType());
        survey.setDietType(request.getDietType());
        survey.setMealsPerDay(request.getMealsPerDay());
        survey.setMonthlyKwh(request.getMonthlyKwh());
        survey.setRenewable(request.getRenewable());

        surveyRepository.save(survey);

        carbonLogService.createOrUpdateDailyLog(user, transport, food, energy, total);

        return new SurveyResponse(transport, food, energy, total);
    }
}