package com.carboncalc.app.entity;

import com.carboncalc.app.enums.GoalStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "goal_title", nullable = false)
    private String goalTitle;

    @Column(name = "target_emission", nullable = false)
    private Double targetEmission;

    @Column(name = "current_emission")
    private Double currentEmission;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}