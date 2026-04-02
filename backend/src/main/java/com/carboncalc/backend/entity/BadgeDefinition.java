package com.carboncalc.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "badge_definitions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BadgeDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String badgeName;

    @Column
    private String description;

    @Column
    private String icon;

    @Column
    private String requirement;

    @Column
    private String bgColor; // e.g. "bg-green-50"

    @Column
    private String rarity; // COMMON, RARE, EPIC

    @Column
    @Builder.Default
    private Integer rewardPoints = 50;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
