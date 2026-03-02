package com.deepika.carbontracker.repository;

import com.deepika.carbontracker.model.Leaderboard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {

    // All entries for a specific user
    List<Leaderboard> findByUserId(Long userId);

    // Get first entry for a user (for upsert logic)
    Optional<Leaderboard> findFirstByUserId(Long userId);

    // Global ranked leaderboard — highest score first
    List<Leaderboard> findAllByOrderByScoreDesc();
}
