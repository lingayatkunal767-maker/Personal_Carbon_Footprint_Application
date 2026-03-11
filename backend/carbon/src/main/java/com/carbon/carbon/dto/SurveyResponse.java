package com.carbon.carbon.dto;

public record SurveyResponse(
        double transportEmission,
        double foodEmission,
        double energyEmission,
        double totalEmission
) {}