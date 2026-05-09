package com.sustainability.tracker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Product entity for marketplace eco-friendly products
 */
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", nullable = false, length = 100)
    private String category; // REUSABLE, ENERGY_EFFICIENT, SUSTAINABLE_FASHION, ORGANIC_FOOD, ECO_TRANSPORT, HOME_GARDEN

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "eco_points_price", precision = 10, scale = 2)
    private BigDecimal ecoPointsPrice; // Price in eco-points (alternative currency)

    @Column(name = "carbon_saving", precision = 10, scale = 2)
    private BigDecimal carbonSaving; // Estimated CO2e saved per year by using this product

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating; // Average rating 0-5

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Column(name = "sustainability_score", precision = 3, scale = 1)
    private BigDecimal sustainabilityScore; // Score 0-10

    @Column(name = "vendor", length = 255)
    private String vendor;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Check if product is in stock
     */
    public boolean isInStock() {
        return stockQuantity != null && stockQuantity > 0;
    }

    /**
     * Reduce stock
     */
    public void reduceStock(int quantity) {
        if (stockQuantity >= quantity) {
            stockQuantity -= quantity;
        } else {
            throw new IllegalStateException("Insufficient stock");
        }
    }
}
