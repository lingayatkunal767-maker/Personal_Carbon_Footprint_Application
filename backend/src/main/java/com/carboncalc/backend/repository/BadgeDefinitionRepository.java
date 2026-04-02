package com.carboncalc.backend.repository;

import com.carboncalc.backend.entity.BadgeDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BadgeDefinitionRepository extends JpaRepository<BadgeDefinition, Long> {
    Optional<BadgeDefinition> findByBadgeName(String badgeName);
    boolean existsByBadgeName(String badgeName);
}
