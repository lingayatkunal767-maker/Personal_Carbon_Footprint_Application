package com.ecotrack.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "badges")
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    // Merged icon fields
    private String icon;         // e.g. "Leaf", "Car", "Zap", "TreePine"
    private String iconName;     // kept for frontend compatibility

    // Merged category/type fields
    private String category;     // transport, energy, food, general
    private String type;         // transport, energy, tree

    private Double thresholdKg;  // kg CO2 threshold to earn this badge
    private Double threshold;    // kept for your badge logic

    private String color;        // e.g. "text-green-600"
    private String bgColor;      // e.g. "bg-green-100"

    private boolean active;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        // Sets active to true by default
        this.active = true;
    }
}