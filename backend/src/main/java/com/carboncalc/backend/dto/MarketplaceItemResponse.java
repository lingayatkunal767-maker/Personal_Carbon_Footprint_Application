package com.carboncalc.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class MarketplaceItemResponse {
    private Long id;
    private String itemName;
    private String itemType;
    private Double price;
    private String description;
    private Double carbonOffsetValue;
    private LocalDateTime createdAt;
}
