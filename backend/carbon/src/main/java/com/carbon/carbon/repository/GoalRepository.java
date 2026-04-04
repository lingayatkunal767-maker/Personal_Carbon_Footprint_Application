package com.carbon.carbon.repository;

import com.carbon.carbon.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    
    List<Goal> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Goal> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);
    
    List<Goal> findByUserIdAndStatus(Long userId, String status);
    
    List<Goal> findByStatus(String status);
    
    Optional<Goal> findByIdAndUserId(Long id, Long userId);
    
    long countByUserIdAndStatus(Long userId, String status);
}
