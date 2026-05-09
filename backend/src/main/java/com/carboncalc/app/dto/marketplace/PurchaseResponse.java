package com.carboncalc.app.dto.marketplace;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseResponse {

    private Long transactionId;
    private String message;
    private Double amount;
}