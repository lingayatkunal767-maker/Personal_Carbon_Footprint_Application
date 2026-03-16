package com.sustainability.tracker.service;

import com.sustainability.tracker.dto.*;
import com.sustainability.tracker.repository.CarbonLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final StatsService statsService;
    private final CarbonLogService carbonLogService;
    private final CarbonLogRepository carbonLogRepository;

    public DashboardDTO getDashboardData(Long userId) {
        // Get user statistics
        StatsDTO stats = statsService.getUserStats(userId);

        // Get recent carbon logs (last 30 days)
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<CarbonLogResponse> recentLogs = carbonLogService.getCarbonLogs(userId, thirtyDaysAgo, LocalDate.now());

        // Get monthly comparison (last 6 months)
        List<MonthlyStatsDTO> monthlyComparison = statsService.getMonthlyComparison(userId, 6);

        // Get emissions breakdown by category
        List<EmissionsBreakdownDTO> emissionsBreakdown = getEmissionsBreakdownFromLogs(userId);

        // Calculate weekly total and change percentage
        LocalDate oneWeekAgo = LocalDate.now().minusDays(7);
        LocalDate twoWeeksAgo = LocalDate.now().minusDays(14);
        
        BigDecimal thisWeekTotal = carbonLogRepository.findByUserIdAndLogDateBetweenOrderByLogDate(userId, oneWeekAgo, LocalDate.now())
                .stream()
                .map(log -> log.getTotalEmission() != null ? log.getTotalEmission() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal lastWeekTotal = carbonLogRepository.findByUserIdAndLogDateBetweenOrderByLogDate(userId, twoWeeksAgo, oneWeekAgo)
                .stream()
                .map(log -> log.getTotalEmission() != null ? log.getTotalEmission() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal changePercentage = calculateChangePercentage(lastWeekTotal, thisWeekTotal);

        return new DashboardDTO(
                stats,
                recentLogs,
                monthlyComparison,
                emissionsBreakdown,
                thisWeekTotal,
                changePercentage
        );
    }

    private List<EmissionsBreakdownDTO> getEmissionsBreakdownFromLogs(Long userId) {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        var logs = carbonLogRepository.findByUserIdAndLogDateBetweenOrderByLogDate(userId, thirtyDaysAgo, LocalDate.now());

        BigDecimal transportTotal = logs.stream()
                .map(log -> log.getTransportEmission() != null ? log.getTransportEmission() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal foodTotal = logs.stream()
                .map(log -> log.getFoodEmission() != null ? log.getFoodEmission() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal energyTotal = logs.stream()
                .map(log -> log.getEnergyEmission() != null ? log.getEnergyEmission() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal grandTotal = transportTotal.add(foodTotal).add(energyTotal);

        return List.of(
                new EmissionsBreakdownDTO("Transport", transportTotal, calculatePercentage(transportTotal, grandTotal)),
                new EmissionsBreakdownDTO("Food & Diet", foodTotal, calculatePercentage(foodTotal, grandTotal)),
                new EmissionsBreakdownDTO("Energy Usage", energyTotal, calculatePercentage(energyTotal, grandTotal))
        );
    }

    private Double calculatePercentage(BigDecimal part, BigDecimal total) {
        if (total.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return part.divide(total, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    private BigDecimal calculateChangePercentage(BigDecimal oldValue, BigDecimal newValue) {
        if (oldValue.compareTo(BigDecimal.ZERO) == 0) {
            return newValue.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO : BigDecimal.valueOf(100);
        }
        return newValue.subtract(oldValue)
                .divide(oldValue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }
}
