package com.sustainability.tracker.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.math.BigDecimal;

/**
 * Read-only entity mapped to the PostgreSQL materialized view 'leaderboard'.
 * Refresh the view via the /api/leaderboard/refresh endpoint or a scheduled job.
 */
@Entity
@Immutable
@Subselect("SELECT id, name, profile_picture, badge_count, total_carbon_saved, rank FROM leaderboard")
@Data
@NoArgsConstructor
public class Leaderboard {

    @Id
    private Long id;

    private String name;

    @Column(name = "profile_picture")
    private String profilePicture;

    @Column(name = "badge_count")
    private Long badgeCount;

    @Column(name = "total_carbon_saved")
    private BigDecimal totalCarbonSaved;

    private Long rank;
}
