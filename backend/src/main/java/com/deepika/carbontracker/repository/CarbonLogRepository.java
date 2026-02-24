package com.deepika.carbontracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.deepika.carbontracker.model.CarbonLog;
import java.util.List;

public interface CarbonLogRepository extends JpaRepository<CarbonLog, Long> {

    List<CarbonLog> findByUserId(Long userId);
}
