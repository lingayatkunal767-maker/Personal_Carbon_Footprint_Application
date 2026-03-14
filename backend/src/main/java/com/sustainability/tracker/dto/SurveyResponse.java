package com.sustainability.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyResponse {
    private Long surveyId;
    private LocalDate logDate;
    private BigDecimal transportEmission;
    private BigDecimal foodEmission;
    private BigDecimal energyEmission;
    private BigDecimal totalEmission;
    private BigDecimal customizedTotalEmission;
    private BigDecimal datasetPredictedFootprint;
    private String carbonImpactLevel;
    private Integer matchedDatasetRecords;
    private Boolean datasetConnected;

    public SurveyResponse(Long surveyId,
                          LocalDate logDate,
                          BigDecimal transportEmission,
                          BigDecimal foodEmission,
                          BigDecimal energyEmission,
                          BigDecimal totalEmission) {
        this.surveyId = surveyId;
        this.logDate = logDate;
        this.transportEmission = transportEmission;
        this.foodEmission = foodEmission;
        this.energyEmission = energyEmission;
        this.totalEmission = totalEmission;
        this.customizedTotalEmission = totalEmission;
    }
}
