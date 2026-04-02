package com.carboncalc.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String badgeName;

    @Column
    private String description;

    @Column(nullable = false)
    private LocalDateTime awardedAt;

    @Column
    @Builder.Default
    private Boolean isClaimed = false;

    @Column
    private LocalDateTime claimedAt;

    @Column
    @Builder.Default
    private Integer rewardPoints = 0;
}
