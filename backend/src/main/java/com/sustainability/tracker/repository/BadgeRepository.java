package com.sustainability.tracker.repository;

import com.sustainability.tracker.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {

    List<Badge> findByUserIdOrderByEarnedDateDesc(Long userId);

    long countByUserId(Long userId);
}
