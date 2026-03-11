package com.carbon.carbon.repository;

import com.carbon.carbon.entity.CarbonLog;
import com.carbon.carbon.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

public interface CarbonLogRepository extends JpaRepository<CarbonLog, Long> {

    Optional<CarbonLog> findByUserAndDate(User user, LocalDate date);

    List<CarbonLog> findByUserOrderByDateDesc(User user);

    List<CarbonLog> findByUserAndDateBetween(User user,
                                             LocalDate from,
                                             LocalDate to);
}