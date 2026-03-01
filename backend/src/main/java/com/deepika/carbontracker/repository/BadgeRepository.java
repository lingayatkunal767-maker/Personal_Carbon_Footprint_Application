package com.deepika.carbontracker.repository;

import com.deepika.carbontracker.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {

    List<Badge> findByUserId(Long userId);

    boolean existsByUserIdAndBadgeName(Long userId, String badgeName);
}
