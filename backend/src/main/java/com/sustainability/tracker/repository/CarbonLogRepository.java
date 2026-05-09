package com.sustainability.tracker.repository;

import com.sustainability.tracker.entity.CarbonLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarbonLogRepository extends JpaRepository<CarbonLog, Long> {

    Optional<CarbonLog> findByUserIdAndLogDate(Long userId, LocalDate logDate);

    List<CarbonLog> findByUserIdAndLogDateBetweenOrderByLogDate(Long userId, LocalDate from, LocalDate to);

    List<CarbonLog> findByUserIdOrderByLogDate(Long userId);

    List<CarbonLog> findAllByOrderByLogDateDesc();

    List<CarbonLog> findByLogDateBetweenOrderByLogDateDesc(LocalDate from, LocalDate to);
}
