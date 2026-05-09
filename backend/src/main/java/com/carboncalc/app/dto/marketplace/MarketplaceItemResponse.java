package com.carboncalc.app.dto.marketplace;

import com.carboncalc.app.enums.MarketplaceItemType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceItemResponse {

    private Long id;
    private String itemName;
    private MarketplaceItemType itemType;
    private Double price;
    private String description;
}