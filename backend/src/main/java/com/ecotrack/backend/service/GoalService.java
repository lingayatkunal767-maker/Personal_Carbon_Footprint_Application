package com.ecotrack.backend.service;

import com.ecotrack.backend.dto.GoalRequest;
import com.ecotrack.backend.dto.GoalResponse;
import com.ecotrack.backend.entity.Goal;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepo;
    private final BadgeService badgeService;

    /**
     * Fetches both personal goals and community-wide admin goals.
     */
    public List<GoalResponse> getAll(User user) {
        // 1. Get personal goals for this specific user
        List<Goal> personalGoals = goalRepo.findByUserOrderByCreatedAtDesc(user);

        // 2. Get community goals posted by any Admin
        List<Goal> communityGoals = goalRepo.findByIsCommunityGoalTrueOrderByCreatedAtDesc();

        // 3. Merge them and convert to DTOs
        return Stream.concat(personalGoals.stream(), communityGoals.stream())
                .distinct()
                .map(this::toDto)
                .toList();
    }

    /**
     * Creates a goal. If the creator is an ADMIN, it is flagged as a community goal.
     */
    public GoalResponse create(User user, GoalRequest req) {
        boolean isCommunity = "ADMIN".equalsIgnoreCase(user.getRole());

        Goal g = Goal.builder()
                .user(user)
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory())
                .targetAmount(req.getTargetAmount())
                .deadline(req.getDeadline())
                .currentProgress(0.0)
                .status("ACTIVE")
                .isCommunityGoal(isCommunity) // Correctly flags the goal
                .build();

        return toDto(goalRepo.save(g));
    }

    /**
     * Updates progress for a specific personal goal.
     */
    public GoalResponse updateProgress(User user, Long id, Double progress) {
        Goal g = goalRepo.findById(id)
                .filter(x -> x.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        g.setCurrentProgress(progress);
        checkGoalCompletion(g);

        return toDto(goalRepo.save(g));
    }

    /**
     * Milestone 4: Finds the latest ACTIVE personal goal and increments progress.
     */
    public GoalResponse addProgress(User user, Double additionalProgress) {
        Goal g = goalRepo.findByUserOrderByCreatedAtDesc(user).stream()
                .filter(goal -> "ACTIVE".equals(goal.getStatus()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No active goal found to update"));

        g.setCurrentProgress(g.getCurrentProgress() + additionalProgress);
        checkGoalCompletion(g);

        return toDto(goalRepo.save(g));
    }

    public void delete(User user, Long id) {
        Goal g = goalRepo.findById(id)
                .filter(x -> x.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        goalRepo.delete(g);
    }

    /**
     * Validates completion and awards the appropriate badge.
     */
    public void checkGoalCompletion(Goal goal) {
        double pct = goal.getTargetAmount() > 0 ? (goal.getCurrentProgress() / goal.getTargetAmount()) * 100 : 0;

        if (pct >= 100 && !"COMPLETED".equals(goal.getStatus())) {
            goal.setStatus("COMPLETED");

            String badgeName = switch(goal.getCategory().toLowerCase()) {
                case "transport" -> "Transport Pro";
                case "food"      -> "Green Eater";
                case "energy"    -> "Power Saver";
                default          -> "Goal Getter";
            };

            badgeService.awardBadge(goal.getUser().getId(), badgeName);
        }
    }

    /**
     * Endpoint for specifically fetching only community challenges.
     */
    public List<GoalResponse> getGlobalCommunityGoals() {
        return goalRepo.findByIsCommunityGoalTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    private GoalResponse toDto(Goal g) {
        int pct = g.getTargetAmount() > 0 ? (int) Math.min((g.getCurrentProgress() / g.getTargetAmount()) * 100, 100) : 0;

        return GoalResponse.builder()
                .id(g.getId())
                .title(g.getTitle())
                .description(g.getDescription())
                .category(g.getCategory())
                .targetAmount(g.getTargetAmount())
                .currentProgress(g.getCurrentProgress())
                .progressPercentage(pct)
                .deadline(g.getDeadline())
                .status(g.getStatus())
                .createdAt(g.getCreatedAt())
                // FIX: Safely handle null values from the database
                .isCommunityGoal(Boolean.TRUE.equals(g.getIsCommunityGoal()))
                .build();
    }
}