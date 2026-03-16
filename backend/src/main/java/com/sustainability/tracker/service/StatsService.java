package com.sustainability.tracker.service;

import com.sustainability.tracker.dto.EmissionsBreakdownDTO;
import com.sustainability.tracker.dto.MonthlyStatsDTO;
import com.sustainability.tracker.dto.StatsDTO;
import com.sustainability.tracker.entity.CarbonLog;
import com.sustainability.tracker.repository.BadgeRepository;
import com.sustainability.tracker.repository.CarbonLogRepository;
import com.sustainability.tracker.repository.CarbonActivityRepository;
import com.sustainability.tracker.repository.GoalRepository;
import com.sustainability.tracker.entity.CarbonActivity; // Import CarbonActivity
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatsService {

    private final CarbonActivityRepository activityRepository;
    private final CarbonLogRepository carbonLogRepository;
    private final GoalRepository goalRepository;
    private final BadgeRepository badgeRepository;

    public StatsDTO getUserStats(Long userId) {
        long totalActivities = activityRepository.countByUserId(userId);

        BigDecimal totalCarbonSaved = activityRepository.sumCarbonByUserId(userId);
        if (totalCarbonSaved == null) totalCarbonSaved = BigDecimal.ZERO;

        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        BigDecimal monthlyCarbon = activityRepository.sumCarbonByUserIdAndDateAfter(userId, startOfMonth);
        if (monthlyCarbon == null) monthlyCarbon = BigDecimal.ZERO;

        LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
        BigDecimal weeklyEmissions = activityRepository.sumPositiveCarbonByUserIdAndDateAfter(userId, sevenDaysAgo);
        if (weeklyEmissions == null) weeklyEmissions = BigDecimal.ZERO;

        BigDecimal totalOffset = activityRepository.sumOffsetByUserId(userId);
        if (totalOffset == null) totalOffset = BigDecimal.ZERO;

        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        Long streakDays = activityRepository.countDistinctDaysByUserIdAndDateAfter(userId, thirtyDaysAgo);
        if (streakDays == null) streakDays = 0L;

        long activeGoals = goalRepository.countByUserIdAndStatus(userId, "active");
        long badgeCount  = badgeRepository.countByUserId(userId);

        long ecoPoints = badgeCount * 200L + totalActivities * 20L
                       + totalOffset.longValue() * 5L;

        return new StatsDTO(totalActivities, totalCarbonSaved, monthlyCarbon,
                            weeklyEmissions, totalOffset, activeGoals, badgeCount,
                            ecoPoints, streakDays);
    }

    public List<MonthlyStatsDTO> getMonthlyComparison(Long userId, int months) {
        LocalDate startDate = LocalDate.now().withDayOfMonth(1).minusMonths(Math.max(0, months - 1L));
        List<Object[]> rawData = activityRepository.monthlyTotals(userId, startDate);
        List<MonthlyStatsDTO> result = new ArrayList<>();

        for (Object[] row : rawData) {
            int year = ((Number) row[0]).intValue();
            int monthValue = ((Number) row[1]).intValue();
            String month = String.format("%04d-%02d", year, monthValue);
            BigDecimal total = row[2] != null
                    ? new BigDecimal(row[2].toString())
                    : BigDecimal.ZERO;
            result.add(new MonthlyStatsDTO(month, total));
        }
        return result;
    }

    public List<EmissionsBreakdownDTO> getEmissionsBreakdown(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(6);
        List<CarbonLog> recentCarbonLogs = carbonLogRepository
                .findByUserIdAndLogDateBetweenOrderByLogDate(userId, sevenDaysAgo, today);

        if (!recentCarbonLogs.isEmpty()) {
            return buildBreakdownFromCarbonLogs(recentCarbonLogs);
        }

        List<Object[]> rawData = activityRepository.breakdownByType(userId);
        return buildBreakdownFromActivities(rawData);
    }

    private List<EmissionsBreakdownDTO> buildBreakdownFromCarbonLogs(List<CarbonLog> logs) {
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

        List<EmissionsBreakdownDTO> result = new ArrayList<>();

        if (transportTotal.compareTo(BigDecimal.ZERO) > 0) {
            result.add(new EmissionsBreakdownDTO("transport", transportTotal, percentage(transportTotal, grandTotal)));
        }
        if (foodTotal.compareTo(BigDecimal.ZERO) > 0) {
            result.add(new EmissionsBreakdownDTO("food", foodTotal, percentage(foodTotal, grandTotal)));
        }
        if (energyTotal.compareTo(BigDecimal.ZERO) > 0) {
            result.add(new EmissionsBreakdownDTO("energy", energyTotal, percentage(energyTotal, grandTotal)));
        }

        return result;
    }

    private List<EmissionsBreakdownDTO> buildBreakdownFromActivities(List<Object[]> rawData) {
        List<EmissionsBreakdownDTO> result = new ArrayList<>();

        BigDecimal grandTotal = rawData.stream()
                .map(row -> row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO)
                .filter(v -> v.compareTo(BigDecimal.ZERO) > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        for (Object[] row : rawData) {
            String type = (String) row[0];
            BigDecimal total = row[1] != null
                    ? new BigDecimal(row[1].toString())
                    : BigDecimal.ZERO;
            if (total.compareTo(BigDecimal.ZERO) <= 0) continue; // skip offsets/negatives
                double pct = percentage(total, grandTotal);
            result.add(new EmissionsBreakdownDTO(type, total, pct));
        }
        return result;
    }

            private double percentage(BigDecimal total, BigDecimal grandTotal) {
            return grandTotal.compareTo(BigDecimal.ZERO) == 0
                ? 0
                : total.divide(grandTotal, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
            }

    public List<CarbonActivity> getCarbonLogs(Long userId, LocalDate from, LocalDate to) {
        LocalDate startDate = Optional.ofNullable(from).orElse(LocalDate.MIN);
        LocalDate endDate = Optional.ofNullable(to).orElse(LocalDate.MAX);
        return activityRepository.findByUserIdAndActivityDateBetweenOrderByActivityDateDesc(userId, startDate, endDate);
    }
}
