package com.carbon.carbontracker.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "item_type")
    private String itemType;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(length = 1000)
    private String description;

    @Column(name = "carbon_offset_value")
    private BigDecimal carbonOffsetValue;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}