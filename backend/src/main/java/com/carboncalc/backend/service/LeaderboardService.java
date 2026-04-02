package com.carboncalc.backend.service;

import com.carboncalc.backend.dto.LeaderboardResponse;
import com.carboncalc.backend.entity.Leaderboard;
import com.carboncalc.backend.entity.Survey;
import com.carboncalc.backend.entity.User;
import com.carboncalc.backend.repository.GoalRepository;
import com.carboncalc.backend.repository.LeaderboardRepository;
import com.carboncalc.backend.repository.SurveyRepository;
import com.carboncalc.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final LeaderboardRepository leaderboardRepository;
    private final UserRepository userRepository;
    private final SurveyRepository surveyRepository;
    private final GoalRepository goalRepository;
    private final NotificationService notificationService;

    public List<LeaderboardResponse> getLeaderboard(Long currentUserId) {
        List<Leaderboard> entries = leaderboardRepository.findAllByOrderByScoreAsc();

        // Compute composite score: normalize each metric then weight
        // 50% emissions (lower is better), 30% reduction% (higher is better), 20% goals (higher is better)
        if (entries.isEmpty()) return List.of();

        double maxEmissions  = entries.stream().mapToDouble(e -> e.getScore() != null ? e.getScore() : 0).max().orElse(1);
        double maxReduction  = entries.stream().mapToDouble(e -> e.getReductionPct() != null ? e.getReductionPct() : 0).max().orElse(1);
        double maxGoals      = entries.stream().mapToDouble(e -> e.getGoalsCompleted() != null ? e.getGoalsCompleted() : 0).max().orElse(1);

        // Build scored list
        record Scored(Leaderboard entry, double composite) {}
        List<Scored> scored = entries.stream().map(e -> {
            double emissions  = e.getScore() != null ? e.getScore() : 0;
            double reduction  = e.getReductionPct() != null ? e.getReductionPct() : 0;
            double goals      = e.getGoalsCompleted() != null ? e.getGoalsCompleted() : 0;

            // Normalize 0-1 (emissions: lower is better → invert)
            double normEmissions = maxEmissions > 0 ? 1.0 - (emissions / maxEmissions) : 0;
            double normReduction = maxReduction > 0 ? reduction / maxReduction : 0;
            double normGoals     = maxGoals > 0 ? goals / maxGoals : 0;

            double composite = (normEmissions * 0.50) + (normReduction * 0.30) + (normGoals * 0.20);
            return new Scored(e, composite);
        }).sorted((a, b) -> Double.compare(b.composite(), a.composite())).toList();

        List<LeaderboardResponse> result = new ArrayList<>();
        for (int i = 0; i < scored.size(); i++) {
            Leaderboard e = scored.get(i).entry();
            String displayName = (e.getUser().getName() != null && !e.getUser().getName().isBlank())
                ? e.getUser().getName()
                : e.getUser().getEmail().split("@")[0];
            result.add(LeaderboardResponse.builder()
                .rank(i + 1)
                .userId(e.getUser().getId())
                .username(displayName)
                .score(Math.round(scored.get(i).composite() * 1000.0) / 10.0) // composite as 0-100
                .totalEmissions(Math.round((e.getScore() != null ? e.getScore() : 0) * 100.0) / 100.0)
                .goalsCompleted(e.getGoalsCompleted() != null ? e.getGoalsCompleted() : 0)
                .reductionPct(e.getReductionPct() != null ? Math.round(e.getReductionPct() * 10.0) / 10.0 : 0.0)
                .isCurrentUser(e.getUser().getId().equals(currentUserId))
                .build());
        }
        return result;
    }

    /** Recalculate and upsert leaderboard entry for a user after survey submission */
    @Transactional
    public void refreshLeaderboard(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<Survey> surveys = surveyRepository.findByUserIdOrderByDateDesc(userId);
        if (surveys.isEmpty()) return;

        double avgScore = surveys.stream()
            .mapToDouble(s -> s.getCarbonScore() != null ? s.getCarbonScore() : 0)
            .average().orElse(0.0);

        // Reduction % = how much less than first survey
        double firstScore = surveys.get(surveys.size() - 1).getCarbonScore() != null
            ? surveys.get(surveys.size() - 1).getCarbonScore() : 0;
        double reductionPct = firstScore > 0
            ? ((firstScore - avgScore) / firstScore) * 100 : 0;

        int goalsCompleted = (int) goalRepository.countByUserIdAndStatus(userId, "ACHIEVED");

        Leaderboard entry = leaderboardRepository.findByUserId(userId)
            .orElse(Leaderboard.builder().user(user).build());

        entry.setScore(avgScore);
        entry.setGoalsCompleted(goalsCompleted);
        entry.setReductionPct(reductionPct);
        entry.setUpdatedAt(LocalDateTime.now());
        leaderboardRepository.save(entry);

        // Notify rank update
        long newRank = leaderboardRepository.findAllByOrderByScoreAsc()
            .stream().map(e -> e.getUser().getId()).toList().indexOf(userId) + 1;
        if (newRank > 0) {
            notificationService.push(userId,
                "Leaderboard Updated 📊",
                "Your leaderboard rank is now #" + newRank + " with an average of " +
                Math.round(avgScore * 100.0) / 100.0 + " kg CO₂ per survey.",
                "LEADERBOARD");
        }
    }
}
