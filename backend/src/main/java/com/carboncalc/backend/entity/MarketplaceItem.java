package com.carboncalc.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MarketplaceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String itemName;

    @Column(nullable = false)
    private String itemType;   // e.g. Carbon Offset, Renewable Energy

    @Column(nullable = false)
    private Double price;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Double carbonOffsetValue; // kg CO2 offset

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
