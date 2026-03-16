package com.carboncalc.app.dto.carbon;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonHistoryFilterRequest {

    private LocalDate fromDate;
    private LocalDate toDate;
}