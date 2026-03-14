package com.carbon.carbontracker.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.Optional;
import java.math.BigDecimal;

import com.carbon.carbontracker.repository.CarbonLogRepository;
import com.carbon.carbontracker.model.*;

@Service
public class CarbonLogService {

    @Autowired
    private CarbonLogRepository carbonLogRepository;

    @Autowired
    private GoalService goalService;

    public void createOrUpdateLog(
            User user,
            double transport,
            double food,
            double energy,
            double total,
            com.carbon.carbontracker.dto.SurveyRequest request
    ) {

        LocalDate today = LocalDate.now();

        Optional<CarbonLog> existing =
                carbonLogRepository.findByUserAndDate(user, today);

        BigDecimal transportBD = BigDecimal.valueOf(transport);
        BigDecimal foodBD = BigDecimal.valueOf(food);
        BigDecimal energyBD = BigDecimal.valueOf(energy);
        BigDecimal totalBD = BigDecimal.valueOf(total);

        CarbonLog savedLog;
        BigDecimal emissionChange;

        if (existing.isPresent()) {

            CarbonLog log = existing.get();

            BigDecimal oldTotal = log.getTotalEmission();
            emissionChange = totalBD.subtract(oldTotal);

            log.setTransportEmission(transportBD);
            log.setFoodEmission(foodBD);
            log.setEnergyEmission(energyBD);
            log.setTotalEmission(totalBD);

            log.setTransportMode(request.getTransportMode());
            log.setDistancePerDay(request.getDistancePerDay());
            log.setFuelType(request.getFuelType());
            log.setDietType(request.getDietType());
            log.setMealsPerDay(request.getMealsPerDay());
            log.setEatingOutFrequency(request.getEatingOutFrequency());
            log.setMonthlyElectricity(request.getMonthlyElectricity());
            log.setRenewable(request.getRenewable());

            savedLog = carbonLogRepository.save(log);

        } else {

            emissionChange = totalBD;

            CarbonLog log = CarbonLog.builder()
                    .user(user)
                    .date(today)
                    .transportEmission(transportBD)
                    .foodEmission(foodBD)
                    .energyEmission(energyBD)
                    .totalEmission(totalBD)
                    .transportMode(request.getTransportMode())
                    .distancePerDay(request.getDistancePerDay())
                    .fuelType(request.getFuelType())
                    .dietType(request.getDietType())
                    .mealsPerDay(request.getMealsPerDay())
                    .eatingOutFrequency(request.getEatingOutFrequency())
                    .monthlyElectricity(request.getMonthlyElectricity())
                    .renewable(request.getRenewable())
                    .build();

            savedLog = carbonLogRepository.save(log);
        }

        goalService.updateGoalsForUser(
    savedLog.getUser().getId(),
    transportBD,
    foodBD,
    energyBD
);
    }
}