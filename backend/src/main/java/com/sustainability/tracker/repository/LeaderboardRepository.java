package com.sustainability.tracker.repository;

import com.sustainability.tracker.entity.Leaderboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {

    @Query(value = "SELECT * FROM leaderboard ORDER BY rank LIMIT :limit",
           nativeQuery = true)
    List<Leaderboard> findTopByLimit(@org.springframework.data.repository.query.Param("limit") int limit);

    @Query(value = "REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard",
           nativeQuery = true)
    void refreshView();
}
