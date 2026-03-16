package com.sustainability.tracker.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_badge_assignments", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "badge_definition_id"})
})
@Data
@NoArgsConstructor
public class UserBadgeAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_definition_id", nullable = false)
    private BadgeDefinition badgeDefinition;

    @Column(name = "assigned_reason", columnDefinition = "TEXT")
    private String assignedReason;

    @CreationTimestamp
    @Column(name = "assigned_at", updatable = false)
    private LocalDateTime assignedAt;
}
