package com.carbon.carbon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketplaceDTO {
    private Long id;
    private String itemName;
    private BigDecimal itemPrice;
    private String description;
    private LocalDateTime createdAt;
}
