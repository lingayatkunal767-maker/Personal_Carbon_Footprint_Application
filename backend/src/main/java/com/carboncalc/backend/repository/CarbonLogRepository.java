package com.carboncalc.backend.repository;

import com.carboncalc.backend.entity.CarbonLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarbonLogRepository extends JpaRepository<CarbonLog, Long> {
    List<CarbonLog> findByUserIdOrderByDateDesc(Long userId);
}
