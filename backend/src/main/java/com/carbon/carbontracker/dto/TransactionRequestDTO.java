package com.carbon.carbontracker.dto;

import lombok.*;

@Data
public class TransactionRequestDTO {
    private Long userId;
    private Long marketplaceItemId;
}