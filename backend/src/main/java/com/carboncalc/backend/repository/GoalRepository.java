package com.carboncalc.backend.repository;

import com.carboncalc.backend.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, String status);
    Optional<Goal> findByIdAndUserId(Long id, Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM goals WHERE id = :goalId AND user_id = :userId", nativeQuery = true)
    int deleteByIdAndUserId(@Param("goalId") Long goalId, @Param("userId") Long userId);
}
