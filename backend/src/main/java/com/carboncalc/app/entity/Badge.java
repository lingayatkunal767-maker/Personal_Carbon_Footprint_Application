package com.carboncalc.app.entity;

import com.carboncalc.app.enums.BadgeType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "badge_name", nullable = false)
    private BadgeType badgeName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "awarded_at")
    private LocalDateTime awardedAt;
}