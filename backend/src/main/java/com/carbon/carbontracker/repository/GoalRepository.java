
package com.carbon.carbontracker.repository;

import com.carbon.carbontracker.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUser_Id(Long userId);

    List<Goal> findByUser_IdAndStatus(Long userId, Goal.GoalStatus status);

    long countByUser_IdAndStatus(Long userId, Goal.GoalStatus status);
}