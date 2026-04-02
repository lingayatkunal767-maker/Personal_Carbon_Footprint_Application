package com.carboncalc.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private Double totalCarbon;
    private Double averageCarbon;
    private Integer surveyCount;
    private Double totalTransportEmission;
    private Double totalFoodEmission;
    private Double totalEnergyEmission;
    private SurveyResponse latestSurvey;
}
