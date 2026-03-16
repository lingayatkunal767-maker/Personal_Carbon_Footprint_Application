package com.carboncalc.app.repository;

import com.carboncalc.app.entity.CarbonLog;
import com.carboncalc.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CarbonLogRepository extends JpaRepository<CarbonLog, Long> {
    List<CarbonLog> findByUser(User user);
    List<CarbonLog> findByUserAndDateBetween(User user, LocalDate from, LocalDate to);
}