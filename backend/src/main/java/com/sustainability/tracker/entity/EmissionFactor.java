package com.sustainability.tracker.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "emission_factors", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"category", "factor_key"})
})
@Data
@NoArgsConstructor
public class EmissionFactor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "factor_key", nullable = false, length = 100)
    private String factorKey;

    @Column(name = "factor_value", nullable = false, precision = 12, scale = 6)
    private BigDecimal factorValue;

    @Column(length = 50)
    private String unit;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
