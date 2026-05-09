package com.sustainability.tracker.repository;

import com.sustainability.tracker.entity.UserBadgeAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserBadgeAssignmentRepository extends JpaRepository<UserBadgeAssignment, Long> {

    boolean existsByUserIdAndBadgeDefinitionId(Long userId, Long badgeDefinitionId);

    List<UserBadgeAssignment> findByUserIdOrderByAssignedAtDesc(Long userId);
}
