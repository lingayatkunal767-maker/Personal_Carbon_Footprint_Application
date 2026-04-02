package com.carboncalc.backend.service;

import com.carboncalc.backend.dto.GoalRequest;
import com.carboncalc.backend.dto.GoalResponse;
import com.carboncalc.backend.entity.Goal;
import com.carboncalc.backend.entity.User;
import com.carboncalc.backend.repository.GoalRepository;
import com.carboncalc.backend.repository.SurveyRepository;
import com.carboncalc.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final SurveyRepository surveyRepository;
    private final NotificationService notificationService;
    private final BadgeService badgeService;

    @Transactional
    public GoalResponse createGoal(GoalRequest req, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime now = LocalDateTime.now();
        // At creation time, no surveys exist after this goal yet — start at 0
        Goal goal = Goal.builder()
            .user(user)
            .goalTitle(req.getGoalTitle())
            .targetEmission(req.getTargetEmission())
            .currentEmission(0.0)
            .status("ACTIVE")
            .category(req.getCategory())
            .reductionTarget(req.getReductionTarget())
            .timeframe(req.getTimeframe())
            .recurrence(req.getRecurrence())
            .description(req.getDescription())
            .createdAt(now)
            .build();

        Goal saved = goalRepository.save(goal);

        notificationService.push(userId,
            "Goal Created 🎯",
            "New goal \"" + req.getGoalTitle() + "\" set with a target of " + req.getTargetEmission() + " kg CO₂.",
            "GOAL");

        // Evaluate badges — awards "Goal Setter" on first goal creation
        badgeService.evaluateBadges(userId);

        return toDto(saved);
    }

    @Transactional
    public List<GoalResponse> getUserGoals(Long userId) {
        List<Goal> goals = goalRepository.findByUserIdOrderByCreatedAtDesc(userId);
        // Lazily patch old goals that have null metadata fields
        boolean dirty = false;
        for (Goal g : goals) {
            if (g.getCategory()   == null) { g.setCategory("global");    dirty = true; }
            if (g.getTimeframe()  == null) { g.setTimeframe("Not set");  dirty = true; }
            if (g.getRecurrence() == null) { g.setRecurrence("Not set"); dirty = true; }
        }
        if (dirty) goalRepository.saveAll(goals);
        return goals.stream().map(this::toDto).toList();
    }

    @Transactional
    public GoalResponse updateGoal(Long goalId, GoalRequest req, Long userId) {
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new RuntimeException("Goal not found"));
        if (!goal.getUser().getId().equals(userId))
            throw new RuntimeException("Unauthorized");

        // Use latest survey emission as current
        var surveys = surveyRepository.findByUserIdOrderByDateDesc(userId);
        double current = surveys.isEmpty() ? 0.0
            : (surveys.get(0).getCarbonScore() != null ? surveys.get(0).getCarbonScore() : 0.0);

        goal.setGoalTitle(req.getGoalTitle());
        goal.setTargetEmission(req.getTargetEmission());
        goal.setCurrentEmission(current);
        goal.setStatus(current > 0 && current <= req.getTargetEmission() ? "ACHIEVED" : "ACTIVE");
        if (req.getCategory()        != null) goal.setCategory(req.getCategory());
        if (req.getTimeframe()       != null) goal.setTimeframe(req.getTimeframe());
        if (req.getRecurrence()      != null) goal.setRecurrence(req.getRecurrence());
        if (req.getReductionTarget() != null) goal.setReductionTarget(req.getReductionTarget());
        if (req.getDescription()     != null) goal.setDescription(req.getDescription());
        return toDto(goalRepository.save(goal));
    }

    @Transactional
    public void deleteGoal(Long goalId, Long userId) {
        // Verify the goal exists and belongs to this user before deleting
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
            .orElseThrow(() -> new RuntimeException("Goal not found or unauthorized"));
        goalRepository.delete(goal);
    }

    /** Called after each survey submission to refresh all active goals */
    @Transactional
    public void refreshGoalsForUser(Long userId) {
        List<Goal> goals = goalRepository.findByUserIdOrderByCreatedAtDesc(userId);

        // Get ALL surveys for this user (no date filtering — avoids timezone issues)
        var allSurveys = surveyRepository.findByUserIdOrderByDateDesc(userId);
        if (allSurveys.isEmpty()) return;

        // Use the most recent survey's carbon score as the current emission
        double latestEmission = allSurveys.get(0).getCarbonScore() != null
            ? allSurveys.get(0).getCarbonScore() : 0.0;

        // Also compute overall average for context
        double avgEmission = allSurveys.stream()
            .mapToDouble(s -> s.getCarbonScore() != null ? s.getCarbonScore() : 0)
            .average().orElse(0.0);

        System.out.println("[GoalService] refreshGoalsForUser userId=" + userId
            + " latestEmission=" + latestEmission
            + " avgEmission=" + avgEmission
            + " activeGoals=" + goals.stream().filter(g -> "ACTIVE".equals(g.getStatus())).count());

        boolean goalAchieved = false;
        for (Goal g : goals) {
            if (!"ACTIVE".equals(g.getStatus())) continue;

            // Use latest emission as current value
            g.setCurrentEmission(Math.round(latestEmission * 100.0) / 100.0);

            System.out.println("[GoalService] Goal id=" + g.getId()
                + " title=" + g.getGoalTitle()
                + " target=" + g.getTargetEmission()
                + " current=" + latestEmission);

            if (latestEmission > 0 && latestEmission <= g.getTargetEmission()) {
                g.setStatus("ACHIEVED");
                System.out.println("[GoalService] Goal ACHIEVED: " + g.getGoalTitle());
                notificationService.push(userId,
                    "Goal Achieved! 🎯",
                    "Congratulations! You completed your goal \"" + g.getGoalTitle() + "\".",
                    "GOAL");
                goalAchieved = true;
            }
        }
        goalRepository.saveAll(goals);

        // Re-evaluate badges after goal status changes
        if (goalAchieved) {
            badgeService.evaluateBadges(userId);
        }
    }

    private GoalResponse toDto(Goal g) {
        double current = g.getCurrentEmission() != null ? g.getCurrentEmission() : 0;
        double target  = g.getTargetEmission()  != null ? g.getTargetEmission()  : 1;

        double pct;
        if ("ACHIEVED".equals(g.getStatus())) {
            pct = 100.0;
        } else if (current == 0.0) {
            pct = 0.0;
        } else {
            // Progress = how much the user has reduced toward the target.
            // If current > target: user is still above target, show partial progress.
            // Formula: progress = (1 - (current - target) / target) * 100, clamped 0-99
            // Simpler: pct = target / current * 100, capped at 99 until achieved
            pct = target > 0 ? Math.min(99, Math.max(0, Math.round((target / current) * 100 * 10.0) / 10.0)) : 0;
        }
        return GoalResponse.builder()
            .id(g.getId())
            .goalTitle(g.getGoalTitle())
            .targetEmission(g.getTargetEmission())
            .currentEmission(Math.round(current * 100.0) / 100.0)
            .status(g.getStatus())
            .progressPct(pct)
            .category(g.getCategory() != null ? g.getCategory() : "global")
            .reductionTarget(g.getReductionTarget() != null ? g.getReductionTarget() : 0)
            .timeframe(g.getTimeframe() != null ? g.getTimeframe() : "Not set")
            .recurrence(g.getRecurrence() != null ? g.getRecurrence() : "Not set")
            .description(g.getDescription())
            .createdAt(g.getCreatedAt())
            .build();
    }
}
