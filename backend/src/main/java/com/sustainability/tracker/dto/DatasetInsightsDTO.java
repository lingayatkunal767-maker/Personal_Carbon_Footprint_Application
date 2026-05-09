package com.sustainability.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DatasetInsightsDTO {
    private Boolean datasetConnected;
    private Integer datasetRecords;
    private BigDecimal datasetAverageFootprint;
    private BigDecimal lowImpactAverageFootprint;
    private BigDecimal personalizedPredictedFootprint;
    private String personalizedImpactLevel;
    private Integer matchedDatasetRecords;
    private List<EcoTipDTO> tips;
}
