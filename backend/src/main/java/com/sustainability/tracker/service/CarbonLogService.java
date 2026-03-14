package com.sustainability.tracker.service;

import com.sustainability.tracker.dto.CarbonLogResponse;
import com.sustainability.tracker.dto.CarbonLogUpdateRequest;
import com.sustainability.tracker.entity.CarbonLog;
import com.sustainability.tracker.repository.CarbonLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
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

    @Transactional
    public CarbonLogResponse updateCarbonLog(Long userId, LocalDate logDate, CarbonLogUpdateRequest request) {
        CarbonLog log = carbonLogRepository.findByUserIdAndLogDate(userId, logDate)
                .orElseThrow(() -> new IllegalArgumentException("Carbon log not found for user/date."));

        BigDecimal transport = safeEmission(request.getTransportEmission());
        BigDecimal food = safeEmission(request.getFoodEmission());
        BigDecimal energy = safeEmission(request.getEnergyEmission());
        BigDecimal total = transport.add(food).add(energy).setScale(2, RoundingMode.HALF_UP);

        log.setTransportEmission(transport);
        log.setFoodEmission(food);
        log.setEnergyEmission(energy);
        log.setTotalEmission(total);

        CarbonLog saved = carbonLogRepository.save(log);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteCarbonLog(Long userId, LocalDate logDate) {
        carbonLogRepository.findByUserIdAndLogDate(userId, logDate)
                .ifPresent(carbonLogRepository::delete);
    }

    private BigDecimal safeEmission(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Emission values cannot be negative.");
        }
        return value.setScale(2, RoundingMode.HALF_UP);
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
