package com.carboncalc.app.dto.carbon;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonTrendResponse {

    private String label;
    private Double totalEmission;
}