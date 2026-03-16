package com.carboncalc.app.dto.carbon;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonCalculationResponse {

    private Double transportEmission;
    private Double foodEmission;
    private Double energyEmission;
    private Double totalEmission;
}
