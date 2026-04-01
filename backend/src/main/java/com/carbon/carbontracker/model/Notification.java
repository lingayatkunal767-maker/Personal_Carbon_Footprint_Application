package com.carbon.carbontracker.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;  // null = global/admin broadcast

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String message;

    private String type;  // GOAL, BADGE, LEADERBOARD, EMISSION, PURCHASE

    @Column(name = "is_read")
    private Boolean isRead = false;

    /** If true, user has dismissed this notification in the UI. Admins still see it. */
    @Column(name = "hidden_for_user")
    private Boolean hiddenForUser = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "admin_name")
    private String adminName;

    @Column(name = "ip_address")
    private String ipAddress;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = createdAt;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}