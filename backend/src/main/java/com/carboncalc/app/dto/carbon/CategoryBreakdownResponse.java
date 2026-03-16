package com.carboncalc.app.dto.carbon;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryBreakdownResponse {

    private Double transportEmission;
    private Double foodEmission;
    private Double energyEmission;
}