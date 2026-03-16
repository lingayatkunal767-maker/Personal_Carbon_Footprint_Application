package com.sustainability.tracker.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "badge_definitions")
@Data
@NoArgsConstructor
public class BadgeDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "badge_name", nullable = false, unique = true, length = 120)
    private String badgeName;

    @Column(name = "badge_type", nullable = false, length = 50)
    private String badgeType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "threshold_percent", precision = 5, scale = 2)
    private java.math.BigDecimal thresholdPercent;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
