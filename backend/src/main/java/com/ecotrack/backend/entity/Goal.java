package com.ecotrack.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "goals")
public class Goal {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler",
            "password", "otp", "otpExpiry", "credits", "enabled"})
    private User user;

    private String title;
    private String description;
    private String category;
    private Double targetAmount;
    private Double currentProgress;
    private LocalDate deadline;
    private String status;
    private LocalDateTime createdAt;

    @Builder.Default
    private Boolean isCommunityGoal = false;

    // Community goal stats — how many users accepted / rejected this challenge
    @Builder.Default
    private Integer acceptedCount = 0;

    @Builder.Default
    private Integer rejectedCount = 0;

    @PrePersist
    public void prePersist() {
        if (createdAt       == null) createdAt       = LocalDateTime.now();
        if (status          == null) status          = "ACTIVE";
        if (currentProgress == null) currentProgress = 0.0;
        if (isCommunityGoal == null) isCommunityGoal = false;
        if (acceptedCount   == null) acceptedCount   = 0;
        if (rejectedCount   == null) rejectedCount   = 0;
    }
}
