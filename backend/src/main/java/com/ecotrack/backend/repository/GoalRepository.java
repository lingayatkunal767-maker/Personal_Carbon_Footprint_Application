package com.ecotrack.backend.repository;

import com.ecotrack.backend.entity.Goal;
import com.ecotrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUserOrderByCreatedAtDesc(User user);

    long countByUserAndStatus(User user, String status);

    List<Goal> findByIsCommunityGoalTrueOrderByCreatedAtDesc();

    // FIX: get all active personal goals for a user (not just the first one)
    List<Goal> findByUserAndStatusOrderByCreatedAtDesc(User user, String status);
}
