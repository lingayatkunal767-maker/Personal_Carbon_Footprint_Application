package com.carbon.carbontracker.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TransactionResponseDTO {
    private Long id;
    private String itemName;
    private BigDecimal amount;
    private String status;
    private LocalDateTime createdAt;
}

