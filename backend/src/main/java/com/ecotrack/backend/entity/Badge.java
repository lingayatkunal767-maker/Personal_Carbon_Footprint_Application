package com.ecotrack.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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

    private String icon;        // used by admin dashboard
    private String iconName;    // used by BadgeController/frontend

    private String category;    // transport | energy | food | general
    private String type;        // kept for BadgeService compatibility

    private Double thresholdKg;
    private Double threshold;

    private String color;       // e.g. "text-green-600"
    private String bgColor;     // e.g. "bg-green-100"

    private boolean active;

    // FIX: Without @JsonIgnoreProperties, Jackson recurses Badge→User→StackOverflow (500)
    // This was causing GET /api/admin/badges to crash and show "No badges yet"
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler",
            "password", "otp", "otpExpiry", "credits", "enabled", "createdAt"})
    private User createdBy;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        this.active = true;
        // Keep both icon fields in sync on first save
        if (iconName == null && icon != null) iconName = icon;
        if (icon == null && iconName != null) icon = iconName;
    }
}
