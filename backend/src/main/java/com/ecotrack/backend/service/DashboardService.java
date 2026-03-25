package com.ecotrack.backend.service;

import com.ecotrack.backend.dto.DashboardResponse;
import com.ecotrack.backend.entity.CarbonEntry;
import com.ecotrack.backend.entity.LifestyleSurvey;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.CarbonEntryRepository;
import com.ecotrack.backend.repository.GoalRepository;
import com.ecotrack.backend.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CarbonEntryRepository carbonRepo;
    private final GoalRepository goalRepo;
    private final SurveyRepository surveyRepo;

    public DashboardResponse getDashboard(User user, String period) {
        LocalDate today = LocalDate.now();

        // All-time total
        Double total = carbonRepo.sumByUser(user);
        double totalKg = round1(total != null ? total : 0);

        // This month / last month
        LocalDate startOfMonth     = today.withDayOfMonth(1);
        LocalDate startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDate endOfLastMonth   = startOfMonth.minusDays(1);

        Double thisMonthRaw = carbonRepo.sumByUserAndDateBetween(user, startOfMonth, today);
        Double lastMonthRaw = carbonRepo.sumByUserAndDateBetween(user, startOfLastMonth, endOfLastMonth);
        double thisMonthKg  = round1(thisMonthRaw != null ? thisMonthRaw : 0);
        double lastMonthKg  = round1(lastMonthRaw != null ? lastMonthRaw : 0);
        double changePct    = lastMonthKg > 0
            ? Math.round(((thisMonthKg - lastMonthKg) / lastMonthKg) * 1000.0) / 10.0 : 0;

        // Period-specific (Daily / Weekly / Monthly)
        LocalDate periodStart;
        String periodLabel;
        switch (period != null ? period : "monthly") {
            case "daily"  -> { periodStart = today;              periodLabel = "Today"; }
            case "weekly" -> { periodStart = today.minusDays(6); periodLabel = "Last 7 Days"; }
            default       -> { periodStart = startOfMonth;       periodLabel = "This Month"; }
        }
        Double periodRaw = carbonRepo.sumByUserAndDateBetween(user, periodStart, today);
        double periodKg  = round1(periodRaw != null ? periodRaw : 0);

        // Category breakdown — capitalize keys for frontend
        Map<String, Double> breakdown = new LinkedHashMap<>();
        for (Object[] row : carbonRepo.sumByCategoryForUser(user)) {
            String cat = (String) row[0];
            // Capitalize first letter to match frontend expectations
            String key = cat != null && !cat.isEmpty()
                ? Character.toUpperCase(cat.charAt(0)) + cat.substring(1).toLowerCase()
                : cat;
            breakdown.put(key, round1((Double) row[1]));
        }

        // Weekly trend (last 7 days)
        LocalDate sevenAgo = today.minusDays(6);
        Map<LocalDate, Double> daily = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) daily.put(today.minusDays(i), 0.0);
        for (Object[] row : carbonRepo.dailySumForUser(user, sevenAgo)) {
            LocalDate d = (LocalDate) row[0];
            if (daily.containsKey(d)) daily.put(d, round1((Double) row[1]));
        }
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM/dd");
        List<DashboardResponse.WeeklyPoint> trend = daily.entrySet().stream()
            .map(e -> new DashboardResponse.WeeklyPoint(e.getKey().format(fmt), e.getValue()))
            .collect(Collectors.toList());

        // Recent activities (last 5 entries) for the dashboard table
        List<Map<String, Object>> recentActivities = new ArrayList<>();
        List<CarbonEntry> entries = carbonRepo.findByUserOrderByDateDescCreatedAtDesc(user);
        for (int i = 0; i < Math.min(5, entries.size()); i++) {
            CarbonEntry e = entries.get(i);
            Map<String, Object> act = new LinkedHashMap<>();
            act.put("date",           e.getDate() != null ? e.getDate().toString() : "");
            act.put("category",       e.getCategory() != null
                ? Character.toUpperCase(e.getCategory().charAt(0)) + e.getCategory().substring(1) : "");
            act.put("description",    e.getActivity() != null ? e.getActivity() : "");
            act.put("emissionAmount", round1(e.getAmount()));
            recentActivities.add(act);
        }

        // Member since
        String memberSince = user.getCreatedAt() != null
            ? user.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")) : "";

        // Survey estimated footprint
        Double estimatedFootprint = surveyRepo.findByUser(user)
            .map(LifestyleSurvey::getEstimatedAnnualFootprint)
            .orElse(null);

        return DashboardResponse.builder()
            .userName(user.getName())
            .memberSince(memberSince)
            .totalCarbonKg(totalKg)
            .thisMonthCarbonKg(thisMonthKg)
            .lastMonthCarbonKg(lastMonthKg)
            .monthlyChangePercent(changePct)
            .periodCarbonKg(periodKg)
            .periodLabel(periodLabel)
            .categoryBreakdown(breakdown)
            .weeklyTrend(trend)
            .recentActivities(recentActivities)
            .activeGoals(goalRepo.countByUserAndStatus(user, "ACTIVE"))
            .completedGoals(goalRepo.countByUserAndStatus(user, "COMPLETED"))
            .totalBadges(0)
            .leaderboardRank(1)
            .estimatedAnnualFootprint(estimatedFootprint)
            .build();
    }

    private double round1(double v) { return Math.round(v * 10.0) / 10.0; }
}
