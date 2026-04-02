package com.carboncalc.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "goals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String goalTitle;

    @Column(nullable = false)
    private Double targetEmission;   // kg CO2 target per day

    @Column
    private Double currentEmission;  // latest avg daily emission

    @Column(nullable = false)
    private String status;           // ACTIVE, ACHIEVED, FAILED

    @Column
    private String category;         // transport, food, home_energy, waste, global

    @Column
    private Integer reductionTarget; // % reduction target

    @Column
    private String timeframe;        // Next 7 Days, Next 30 Days, etc.

    @Column
    private String recurrence;       // daily, weekly, monthly, one time

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
