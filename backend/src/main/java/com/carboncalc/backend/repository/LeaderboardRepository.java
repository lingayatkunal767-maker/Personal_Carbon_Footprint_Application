package com.carboncalc.backend.repository;

import com.carboncalc.backend.entity.Leaderboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {
    Optional<Leaderboard> findByUserId(Long userId);
    List<Leaderboard> findAllByOrderByScoreAsc();
}
