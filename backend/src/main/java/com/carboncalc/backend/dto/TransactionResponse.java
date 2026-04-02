package com.carboncalc.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class TransactionResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long itemId;
    private String itemName;
    private String itemType;
    private Double carbonOffsetValue;
    private Double amount;
    private String status;
    private LocalDateTime createdAt;
}
