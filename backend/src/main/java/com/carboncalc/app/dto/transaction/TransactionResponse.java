package com.carboncalc.app.dto.transaction;

import com.carboncalc.app.enums.TransactionStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {

    private Long id;
    private String itemName;
    private Double amount;
    private TransactionStatus status;
    private LocalDateTime createdAt;
}