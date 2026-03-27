package com.ecotrack.backend.repository;

import com.ecotrack.backend.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {

    // Kept for basic badge checks
    Optional<Badge> findByName(String name);

    // Teammate's addition: Returns only badges marked as 'active'
    List<Badge> findByActiveTrue();

    // Your Milestone 4 Logic: Finds badges the user hasn't earned yet
    @Query(value = "SELECT * FROM badges WHERE id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = :userId)", nativeQuery = true)
    List<Badge> findLockedBadgesForUser(@Param("userId") Long userId);
}