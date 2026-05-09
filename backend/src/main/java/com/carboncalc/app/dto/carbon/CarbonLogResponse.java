package com.carboncalc.app.dto.carbon;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonLogResponse {

    private Long id;
    private LocalDate date;
    private Double totalEmission;
}