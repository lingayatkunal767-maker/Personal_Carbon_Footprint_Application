package com.ecotrack.backend.repository;


import com.ecotrack.backend.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUserId(Long userId);

    // Checks if a specific achievement exists
    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);

    @Query("SELECT COUNT(ub) > 0 FROM UserBadge ub WHERE ub.user.id = :userId AND ub.badge.name = :badgeName")
    boolean existsByUserIdAndBadgeName(@Param("userId") Long userId, @Param("badgeName") String badgeName);
}