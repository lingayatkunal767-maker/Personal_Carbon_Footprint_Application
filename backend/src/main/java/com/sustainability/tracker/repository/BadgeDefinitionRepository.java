package com.sustainability.tracker.repository;

import com.sustainability.tracker.entity.BadgeDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BadgeDefinitionRepository extends JpaRepository<BadgeDefinition, Long> {

    Optional<BadgeDefinition> findByBadgeNameIgnoreCase(String badgeName);

    List<BadgeDefinition> findByIsActiveTrueOrderByBadgeNameAsc();

    List<BadgeDefinition> findAllByOrderByBadgeNameAsc();
}
