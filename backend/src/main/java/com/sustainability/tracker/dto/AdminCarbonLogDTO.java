package com.sustainability.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminCarbonLogDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private LocalDate logDate;
    private BigDecimal transportEmission;
    private BigDecimal foodEmission;
    private BigDecimal energyEmission;
    private BigDecimal totalEmission;
}
