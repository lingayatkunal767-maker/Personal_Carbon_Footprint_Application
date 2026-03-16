package com.sustainability.tracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
@Data
@NoArgsConstructor
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(name = "badge_name", length = 100, nullable = false)
    private String badgeName;

    @NotBlank
    @Column(name = "badge_type", length = 50, nullable = false)
    private String badgeType;

    @Column(name = "earned_date")
    private LocalDateTime earnedDate = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String description;
}
