package com.carboncalc.app.dto.marketplace;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseRequest {

    private Long marketplaceItemId;
}