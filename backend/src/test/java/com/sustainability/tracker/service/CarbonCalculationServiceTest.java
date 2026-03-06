package com.sustainability.tracker.service;

import com.sustainability.tracker.entity.CarbonLog;
import com.sustainability.tracker.entity.LifestyleSurvey;
import com.sustainability.tracker.repository.CarbonLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CarbonCalculationServiceTest {

    @Mock
    private CarbonLogRepository carbonLogRepository;

    @InjectMocks
    private CarbonCalculationService carbonCalculationService;

    @BeforeEach
    void setUp() {
        // Use ReflectionTestUtils to set the @Value fields
        ReflectionTestUtils.setField(carbonCalculationService, "carFactor", new BigDecimal("0.192"));
        ReflectionTestUtils.setField(carbonCalculationService, "busFactor", new BigDecimal("0.105"));
        ReflectionTestUtils.setField(carbonCalculationService, "trainFactor", new BigDecimal("0.041"));
        ReflectionTestUtils.setField(carbonCalculationService, "autoFactor", new BigDecimal("0.120"));
        ReflectionTestUtils.setField(carbonCalculationService, "evCarFactor", new BigDecimal("0.060"));
        ReflectionTestUtils.setField(carbonCalculationService, "nonVegFactor", new BigDecimal("2.5"));
        ReflectionTestUtils.setField(carbonCalculationService, "vegFactor", new BigDecimal("1.2"));
        ReflectionTestUtils.setField(carbonCalculationService, "electricityFactor", new BigDecimal("0.82"));
        ReflectionTestUtils.setField(carbonCalculationService, "lpgCylinderFactor", new BigDecimal("42.6"));
    }

    @Test
    void testCalculateAndLogEmissions() {
        // Given
        LifestyleSurvey survey = new LifestyleSurvey();
        survey.setUserId(1L);
        survey.setSurveyDate(LocalDate.now());
        survey.setTransportMode(LifestyleSurvey.TransportMode.CAR);
        survey.setFuelType(LifestyleSurvey.FuelType.PETROL);
        survey.setDistanceKmPerDay(new BigDecimal("12.5"));
        survey.setMealsNonVegPerWeek(4);
        survey.setMealsVegPerWeek(10);
        survey.setElectricityKwhPerMonth(new BigDecimal("120.5"));
        survey.setCookingGasCylindersPerMonth(new BigDecimal("0.5"));

        when(carbonLogRepository.findByUserIdAndLogDate(any(), any())).thenReturn(Optional.empty());
        when(carbonLogRepository.save(any(CarbonLog.class))).thenAnswer(i -> i.getArguments()[0]);

        // When
        CarbonLog result = carbonCalculationService.calculateAndLogEmissions(survey);

        // Then
        assertEquals(new BigDecimal("2.40"), result.getTransportEmission()); // 12.5 * 0.192
        assertEquals(new BigDecimal("3.14"), result.getFoodEmission()); // ((4 * 2.5) + (10 * 1.2)) / 7
        assertEquals(new BigDecimal("4.00"), result.getEnergyEmission()); // (120.5 / 30 * 0.82) + (0.5 / 30 * 42.6) = 3.29 + 0.71
        assertEquals(new BigDecimal("9.54"), result.getTotalEmission());
    }
}
