package com.carbon.carbontracker.service;

import com.carbon.carbontracker.dto.LeaderboardEntryResponse;
import com.carbon.carbontracker.model.Goal;
import com.carbon.carbontracker.model.User;
import com.carbon.carbontracker.model.CarbonLog;
import com.carbon.carbontracker.model.WeeklyLeaderboard;
import com.carbon.carbontracker.repository.BadgeRepository;
import com.carbon.carbontracker.repository.GoalRepository;
import com.carbon.carbontracker.repository.UserRepository;
import com.carbon.carbontracker.repository.CarbonLogRepository;
import com.carbon.carbontracker.repository.WeeklyLeaderboardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private BadgeRuleService badgeRuleService;

    @Autowired
    private CarbonLogRepository carbonLogRepository;

    @Autowired
    private WeeklyLeaderboardRepository weeklyLeaderboardRepository;

    /**
     * Build a simple global leaderboard from existing data.
     *
     * For now the score formula is kept in sync with the UI comment:
     *   score = (emissionReduction × 50) + (goalsCompleted × 20) + (badgesEarned × 10)
     *
     * We don't yet compute a real "emissionReduction" per user, so we keep it at 0
     * and rely on completed goals + earned badges to differentiate users.
     */
    public List<LeaderboardEntryResponse> getGlobalLeaderboard() {

        List<User> users = userRepository.findAll();

        List<LeaderboardEntryResponse> entries = users.stream()
                // Exclude admin accounts from the public leaderboard
                .filter(user -> {
                    String role = user.getRole();
                    if (role == null) return true;
                    String r = role.trim().toLowerCase();
                    // handle variants like "ADMIN", "ROLE_ADMIN", "admin_user"
                    return !r.contains("admin");
                })
                .map(user -> {
                    long goalsCompleted =
                            goalRepository.countByUser_IdAndStatus(user.getId(), Goal.GoalStatus.COMPLETED);

                    long badgesEarned = badgeRepository.countByUserId(user.getId());

                    double emissionReduction = computeEmissionReductionPercentage(user);

                    double score =
                            (emissionReduction * 50.0) +
                                    (goalsCompleted * 20.0) +
                                    (badgesEarned * 10.0);

                    return LeaderboardEntryResponse.builder()
                            .userId(user.getId())
                            .userName(user.getName() != null ? user.getName() : user.getEmail())
                            .emissionReduction(emissionReduction)
                            .goalsCompleted((int) goalsCompleted)
                            .badgesEarned((int) badgesEarned)
                            .score(score)
                            .build();
                })
                // keep users even if their score is 0 so everyone appears
                .sorted(Comparator.comparingDouble(LeaderboardEntryResponse::getScore).reversed())
                .collect(Collectors.toList());

        // Award GREEN_CHAMPION badges to top 10% based on computed rankings
        int total = entries.size();
        for (int i = 0; i < entries.size(); i++) {
            LeaderboardEntryResponse e = entries.get(i);
            int rank = i + 1;
            badgeRuleService.onLeaderboardPosition(e.getUserId(), rank, total);
        }

        // Do not break live leaderboard if weekly snapshot persistence fails
        // (for example during first run before schema is migrated).
        try {
            saveWeeklySnapshot(entries);
        } catch (Exception ignored) {
            // Keep API response successful with computed live entries
        }

        return entries;
    }

    private void saveWeeklySnapshot(List<LeaderboardEntryResponse> entries) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        LocalDate weekEnd = weekStart.plusDays(6);

        // Keep one latest snapshot per week: rebuild current week rows
        weeklyLeaderboardRepository.deleteByWeekStart(weekStart);

        List<WeeklyLeaderboard> rows = new ArrayList<>();
        for (int i = 0; i < entries.size(); i++) {
            LeaderboardEntryResponse e = entries.get(i);
            rows.add(WeeklyLeaderboard.builder()
                    .weekStart(weekStart)
                    .weekEnd(weekEnd)
                    .userId(e.getUserId())
                    .userName(e.getUserName())
                    .rankPosition(i + 1)
                    .emissionReduction(e.getEmissionReduction())
                    .goalsCompleted(e.getGoalsCompleted())
                    .badgesEarned(e.getBadgesEarned())
                    .score(e.getScore())
                    .build());
        }
        weeklyLeaderboardRepository.saveAll(rows);
    }

    public List<LeaderboardEntryResponse> getCurrentWeekLeaderboard() {
        LocalDate weekStart = LocalDate.now().with(DayOfWeek.MONDAY);
        return getWeeklyLeaderboardByWeekStart(weekStart);
    }

    public List<LeaderboardEntryResponse> getWeeklyLeaderboardByWeekStart(LocalDate weekStart) {
        if (weekStart == null) {
            weekStart = LocalDate.now().with(DayOfWeek.MONDAY);
        }
        List<WeeklyLeaderboard> rows = weeklyLeaderboardRepository.findByWeekStartOrderByRankPositionAsc(weekStart);

        // If exact week snapshot does not exist yet, fall back to latest available snapshot
        // so UI filters like "Last week" do not show an empty board unexpectedly.
        if (rows.isEmpty()) {
            List<LocalDate> availableWeeks = weeklyLeaderboardRepository.findDistinctWeekStartsDesc();
            if (!availableWeeks.isEmpty()) {
                rows = weeklyLeaderboardRepository.findByWeekStartOrderByRankPositionAsc(availableWeeks.get(0));
            }
        }

        return rows
                .stream()
                .map(r -> LeaderboardEntryResponse.builder()
                        .userId(r.getUserId())
                        .userName(r.getUserName())
                        .emissionReduction(r.getEmissionReduction() != null ? r.getEmissionReduction() : 0.0)
                        .goalsCompleted(r.getGoalsCompleted() != null ? r.getGoalsCompleted() : 0)
                        .badgesEarned(r.getBadgesEarned() != null ? r.getBadgesEarned() : 0)
                        .score(r.getScore() != null ? r.getScore() : 0.0)
                        .build())
                .collect(Collectors.toList());
    }

    public List<LocalDate> getAvailableWeeklySnapshotStarts() {
        return weeklyLeaderboardRepository.findDistinctWeekStartsDesc();
    }

    /**
     * Compute percentage emission reduction for a user by comparing
     * the last 30 days of carbon logs with the previous 30 days.
     *
     * If there is not enough historical data, or the previous window total
     * is zero, this returns 0.
     */
    private double computeEmissionReductionPercentage(User user) {
        LocalDate today = LocalDate.now();

        LocalDate currentStart = today.minusDays(29);
        LocalDate previousStart = today.minusDays(59);
        LocalDate previousEnd = currentStart.minusDays(1);

        List<CarbonLog> currentWindow =
                carbonLogRepository.findByUserAndDateBetween(user, currentStart, today);

        List<CarbonLog> previousWindow =
                carbonLogRepository.findByUserAndDateBetween(user, previousStart, previousEnd);

        double currentTotal = currentWindow.stream()
                .map(CarbonLog::getTotalEmission)
                .filter(e -> e != null)
                .mapToDouble(e -> e.doubleValue())
                .sum();

        double previousTotal = previousWindow.stream()
                .map(CarbonLog::getTotalEmission)
                .filter(e -> e != null)
                .mapToDouble(e -> e.doubleValue())
                .sum();

        if (previousTotal <= 0.0) {
            return 0.0;
        }

        double diff = previousTotal - currentTotal;
        double pct = (diff / previousTotal) * 100.0;

        if (pct < 0.0) {
            return 0.0;
        }
        return pct;
    }
}

