package com.sustainability.tracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "carbon_activities")
@Data
@NoArgsConstructor
public class CarbonActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(name = "activity_type", length = 50, nullable = false)
    private String activityType; // transport, energy, food, waste

    @NotBlank
    @Column(name = "activity_name", nullable = false)
    private String activityName;

    @NotNull
    @Column(name = "carbon_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal carbonAmount;

    @NotNull
    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
