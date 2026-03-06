package com.sustainability.tracker.service;

import com.sustainability.tracker.dto.CarbonLogResponse;
import com.sustainability.tracker.entity.CarbonLog;
import com.sustainability.tracker.repository.CarbonLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CarbonLogService {

    private final CarbonLogRepository carbonLogRepository;

    public List<CarbonLogResponse> getCarbonLogs(Long userId, LocalDate from, LocalDate to) {
        List<CarbonLog> logs;
        if (from != null && to != null) {
            logs = carbonLogRepository.findByUserIdAndLogDateBetweenOrderByLogDate(userId, from, to);
        } else {
            logs = carbonLogRepository.findByUserIdOrderByLogDate(userId);
        }

        return logs.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CarbonLogResponse mapToResponse(CarbonLog log) {
        return new CarbonLogResponse(
                log.getLogDate(),
                log.getTransportEmission(),
                log.getFoodEmission(),
                log.getEnergyEmission(),
                log.getTotalEmission()
        );
    }
}
