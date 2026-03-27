package com.ecotrack.backend.entity;

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
    private User user;

    private String title;
    private String description;
    private String category;
    private Double targetAmount;
    private Double currentProgress;
    private LocalDate deadline;
    private String status;
    private LocalDateTime createdAt;

    // Add this field to flag community-wide goals
    @Builder.Default
    private Boolean isCommunityGoal = false;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = "ACTIVE";
        if (currentProgress == null) currentProgress = 0.0;
        if (isCommunityGoal == null) isCommunityGoal = false;
    }
}
