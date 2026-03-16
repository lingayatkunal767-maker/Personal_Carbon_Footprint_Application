package com.carboncalc.app.dto.carbon;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonLogDetailResponse {

    private Long id;
    private LocalDate date;
    private Double transportEmission;
    private Double foodEmission;
    private Double energyEmission;
    private Double totalEmission;
}