package com.carbon.carbon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {
    private Long id;
    private Long userId;
    private Long marketplaceItemId;
    private String itemName;
    private BigDecimal amount;
    private LocalDateTime createdAt;
}
