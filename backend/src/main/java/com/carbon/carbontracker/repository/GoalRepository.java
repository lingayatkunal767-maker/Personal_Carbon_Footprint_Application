
package com.carbon.carbontracker.repository;

import com.carbon.carbontracker.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUserId(Long userId);

    List<Goal> findByUserIdAndStatus(Long userId, Goal.GoalStatus status);
}
