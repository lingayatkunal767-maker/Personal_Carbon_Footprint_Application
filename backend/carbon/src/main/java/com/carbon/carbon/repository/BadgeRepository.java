package com.carbon.carbon.repository;

import com.carbon.carbon.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    
    List<Badge> findByUserId(Long userId);
    
    List<Badge> findByUserIdOrderByAwardedAtDesc(Long userId);
    
    Optional<Badge> findByUserIdAndBadgeName(Long userId, String badgeName);
    
    boolean existsByUserIdAndBadgeName(Long userId, String badgeName);
    
    long countByUserId(Long userId);
}
