package com.ecotrack.backend.entity;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "marketplace_items")
public class MarketplaceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;        // e.g., "Tree Planting"
    private String description;
    private Double cost;        // Cost in Eco-Credits or Currency
    private Double offsetValue; // How many kg of CO2 this offsets
    private String category;    // e.g., "Forestry", "Renewable"
}