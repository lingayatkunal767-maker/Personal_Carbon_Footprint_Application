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

    @Mock
    private EmissionFactorService emissionFactorService;

    @InjectMocks
    private CarbonCalculationService carbonCalculationService;

    @BeforeEach
    void setUp() {
        // Use ReflectionTestUtils to set the @Value fields
        ReflectionTestUtils.setField(carbonCalculationService, "defaultCarFactor", new BigDecimal("0.192"));
        ReflectionTestUtils.setField(carbonCalculationService, "defaultBusFactor", new BigDecimal("0.105"));
        ReflectionTestUtils.setField(carbonCalculationService, "defaultTrainFactor", new BigDecimal("0.041"));
        ReflectionTestUtils.setField(carbonCalculationService, "defaultAutoFactor", new BigDecimal("0.120"));
        ReflectionTestUtils.setField(carbonCalculationService, "defaultEvCarFactor", new BigDecimal("0.060"));
        ReflectionTestUtils.setField(carbonCalculationService, "defaultNonVegFactor", new BigDecimal("2.5"));
        ReflectionTestUtils.setField(carbonCalculationService, "defaultVegFactor", new BigDecimal("1.2"));
        ReflectionTestUtils.setField(carbonCalculationService, "defaultElectricityFactor", new BigDecimal("0.82"));
        ReflectionTestUtils.setField(carbonCalculationService, "defaultLpgCylinderFactor", new BigDecimal("42.6"));

        when(emissionFactorService.getFactorValue(any(), any(), any())).thenAnswer(invocation -> invocation.getArgument(2));
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
        assertEquals(new BigDecimal("4.01"), result.getEnergyEmission());
        assertEquals(new BigDecimal("9.55"), result.getTotalEmission());
    }
}
