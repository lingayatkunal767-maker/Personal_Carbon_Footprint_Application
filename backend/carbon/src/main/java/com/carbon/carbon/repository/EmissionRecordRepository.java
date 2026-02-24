package com.carbon.carbon.repository;

import com.carbon.carbon.entity.EmissionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmissionRecordRepository extends JpaRepository<EmissionRecord, Long> {
    List<EmissionRecord> findByUserId(Long userId);
}
