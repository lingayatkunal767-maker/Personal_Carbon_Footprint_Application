package com.sustainability.tracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String goalType;

    private BigDecimal targetValue;

    private BigDecimal currentValue;

    // ✅ ADD: deadline + status (GoalService expects these)
    private LocalDate deadline;

    private String status; // active, completed, failed

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (currentValue == null) currentValue = BigDecimal.ZERO;
        if (status == null) status = "active";
    }
}