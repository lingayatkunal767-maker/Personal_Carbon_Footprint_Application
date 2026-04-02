package com.carboncalc.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MarketplaceItemRequest {
    @NotBlank private String itemName;
    @NotBlank private String itemType;
    @NotNull @Min(0) private Double price;
    private String description;
    @NotNull @Min(0) private Double carbonOffsetValue;
}
