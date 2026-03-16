package com.carboncalc.app.dto.carbon;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponse {

    private Double latestEmission;
    private Double averageEmission;
    private Integer ecoPoints;
    private Long totalLogs;
}