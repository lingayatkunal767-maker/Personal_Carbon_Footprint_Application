package com.carbon.carbontracker.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceItemDTO {

    private Long id;
    private String itemName;
    private String itemType;
    private BigDecimal price;
    private String description;
    private BigDecimal carbonOffsetValue;
}