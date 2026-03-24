package com.carbon.carbon.repository;

import com.carbon.carbon.entity.CarbonLog;
import com.carbon.carbon.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarbonLogRepository extends JpaRepository<CarbonLog, Long> {

    // --- userId-based (used by DashboardService, CarbonLogService)
    List<CarbonLog> findByUserId(Long userId);

    Optional<CarbonLog> findByUserIdAndDate(Long userId, LocalDate date);

    List<CarbonLog> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    // --- User-object-based (used by CarbonLogController)
    Optional<CarbonLog> findByUserAndDate(User user, LocalDate date);

    List<CarbonLog> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate);

    List<CarbonLog> findByUserOrderByDateDesc(User user);
}
