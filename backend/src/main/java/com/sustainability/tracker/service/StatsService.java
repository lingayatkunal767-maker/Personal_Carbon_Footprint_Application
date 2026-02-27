package com.sustainability.tracker.service;

import com.sustainability.tracker.dto.EmissionsBreakdownDTO;
import com.sustainability.tracker.dto.MonthlyStatsDTO;
import com.sustainability.tracker.dto.StatsDTO;
import com.sustainability.tracker.repository.BadgeRepository;
import com.sustainability.tracker.repository.CarbonActivityRepository;
import com.sustainability.tracker.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatsService {

    private final CarbonActivityRepository activityRepository;
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
        List<Object[]> rawData = activityRepository.monthlyTotals(userId, months);
        List<MonthlyStatsDTO> result = new ArrayList<>();

        for (Object[] row : rawData) {
            String month = row[0].toString().substring(0, 7); // "yyyy-MM"
            BigDecimal total = row[1] != null
                    ? new BigDecimal(row[1].toString())
                    : BigDecimal.ZERO;
            result.add(new MonthlyStatsDTO(month, total));
        }
        return result;
    }

    public List<EmissionsBreakdownDTO> getEmissionsBreakdown(Long userId) {
        List<Object[]> rawData = activityRepository.breakdownByType(userId);
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
            double pct = grandTotal.compareTo(BigDecimal.ZERO) == 0 ? 0
                    : total.divide(grandTotal, 4, RoundingMode.HALF_UP)
                           .multiply(BigDecimal.valueOf(100))
                           .doubleValue();
            result.add(new EmissionsBreakdownDTO(type, total, pct));
        }
        return result;
    }
}
