
package com.carbon.carbontracker.repository;

import com.carbon.carbontracker.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {

    List<Badge> findByUserId(Long userId);

    long countByUserId(Long userId);

    boolean existsByUserIdAndBadgeName(Long userId, String badgeName);
}
