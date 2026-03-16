package com.sustainability.tracker.dto;

import com.sustainability.tracker.entity.EmissionFactor;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmissionFactorDTO {
    private Long id;

    @NotBlank
    private String category;

    @NotBlank
    private String factorKey;

    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal factorValue;

    private String unit;
    private String description;

    public static EmissionFactorDTO from(EmissionFactor factor) {
        return new EmissionFactorDTO(
                factor.getId(),
                factor.getCategory(),
                factor.getFactorKey(),
                factor.getFactorValue(),
                factor.getUnit(),
                factor.getDescription()
        );
    }
}
