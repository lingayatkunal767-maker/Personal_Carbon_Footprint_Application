package com.carbon.carbon.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "goal_title", nullable = false, length = 255)
    private String goalTitle;

    @Column(name = "target_emission", nullable = false)
    private BigDecimal targetEmission;

    @Column(name = "current_emission", nullable = false)
    private BigDecimal currentEmission;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "timeframe", length = 100)
    private String timeframe;

    @Column(name = "recurrence", length = 50)
    private String recurrence;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "goal_type", nullable = true)
    private String goalType = "REDUCTION";

    public String getGoalType() {
        return goalType != null ? goalType : "REDUCTION";
    }

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    public void prePersist() {
        if (this.status == null) {
            this.status = "active";
        }
        if (this.currentEmission == null) {
            this.currentEmission = BigDecimal.ZERO;
        }
        if (this.goalType == null) {
            this.goalType = "REDUCTION";
        }
        this.createdAt = LocalDateTime.now();
    }
}
