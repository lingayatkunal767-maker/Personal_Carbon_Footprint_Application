package com.carbon.carbon.repository;

import com.carbon.carbon.entity.Leaderboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {
    
    Optional<Leaderboard> findByUserId(Long userId);
    
    Optional<Leaderboard> findByTeamName(String teamName);
    
    List<Leaderboard> findAllByOrderByScoreDesc();
    
    @Query(value = "SELECT * FROM leaderboards ORDER BY score DESC LIMIT :limit", nativeQuery = true)
    List<Leaderboard> findTopLeaderboardUsers(int limit);
}
