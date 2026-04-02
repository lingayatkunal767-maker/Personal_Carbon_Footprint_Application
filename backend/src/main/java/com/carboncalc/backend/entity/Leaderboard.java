package com.carboncalc.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "leaderboard")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Leaderboard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private Double score;            // lower avg emission = higher rank

    @Column
    private Integer goalsCompleted;

    @Column
    private Double reductionPct;     // % reduction vs first survey

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
