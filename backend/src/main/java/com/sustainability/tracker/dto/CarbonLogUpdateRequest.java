package com.sustainability.tracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CarbonLogUpdateRequest {

    @NotNull(message = "Transport emission is required.")
    @DecimalMin(value = "0.0", message = "Transport emission must be non-negative.")
    private BigDecimal transportEmission;

    @NotNull(message = "Food emission is required.")
    @DecimalMin(value = "0.0", message = "Food emission must be non-negative.")
    private BigDecimal foodEmission;

    @NotNull(message = "Energy emission is required.")
    @DecimalMin(value = "0.0", message = "Energy emission must be non-negative.")
    private BigDecimal energyEmission;
}
