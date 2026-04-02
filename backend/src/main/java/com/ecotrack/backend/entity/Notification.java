package com.ecotrack.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Only expose safe user fields — prevents infinite recursion in JSON
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler",
            "password", "otp", "otpExpiry", "credits", "enabled", "createdAt"})
    private User user;

    private String title;
    private String body;
    private String type;       // general | badge | goal | purchase | alert | leaderboard

    @Column(nullable = false)
    private boolean read = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
