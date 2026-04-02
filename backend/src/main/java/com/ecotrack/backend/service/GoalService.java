package com.ecotrack.backend.service;

import com.ecotrack.backend.dto.GoalRequest;
import com.ecotrack.backend.dto.GoalResponse;
import com.ecotrack.backend.entity.Goal;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository      goalRepo;
    private final BadgeService        badgeService;
    private final NotificationService notificationService;

    /** Returns all personal goals + community goals (distinct) */
    public List<GoalResponse> getAll(User user) {
        List<Goal> personal  = goalRepo.findByUserOrderByCreatedAtDesc(user);
        List<Goal> community = goalRepo.findByIsCommunityGoalTrueOrderByCreatedAtDesc();
        log.debug("getAll userId={} personal={} community={}", user.getId(), personal.size(), community.size());
        return Stream.concat(personal.stream(), community.stream())
                .distinct().map(this::toDto).toList();
    }

    /**
     * Create a personal goal.
     * Admin goals are created via AdminController and saved properly.
     */
    public GoalResponse create(User user, GoalRequest req) {
        Goal g = Goal.builder()
                .user(user)
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory())
                .targetAmount(req.getTargetAmount())
                .deadline(req.getDeadline())
                .currentProgress(0.0)
                .status("ACTIVE")
                .isCommunityGoal(false) // Users always create personal goals
                .acceptedCount(0)
                .rejectedCount(0)
                .build();
        GoalResponse r = toDto(goalRepo.save(g));
        log.info("Personal goal created id={} userId={} title='{}'", r.getId(), user.getId(), r.getTitle());
        return r;
    }

    /** Set exact progress on a specific goal */
    public GoalResponse updateProgress(User user, Long id, Double progress) {
        Goal g = goalRepo.findById(id)
                .filter(x -> x.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        g.setCurrentProgress(progress);
        checkGoalCompletion(g);
        log.info("updateProgress goalId={} progress={}", id, progress);
        return toDto(goalRepo.save(g));
    }

    /**
     * FIX: Adds progress to the most-recent ACTIVE personal goal.
     * This is what LogActivityModal and GoalPage call via /api/goals/active/increment.
     */
    public GoalResponse addProgress(User user, Double additionalProgress) {
        // FIX: use findByUserAndStatusOrderByCreatedAtDesc to get all active goals
        List<Goal> active = goalRepo.findByUserAndStatusOrderByCreatedAtDesc(user, "ACTIVE");
        if (active.isEmpty()) {
            throw new RuntimeException("No active personal goal found. Create a goal first.");
        }
        Goal g = active.get(0);
        double newProgress = (g.getCurrentProgress() != null ? g.getCurrentProgress() : 0.0) + additionalProgress;
        g.setCurrentProgress(newProgress);
        checkGoalCompletion(g);
        log.info("addProgress goalId={} added={} total={}", g.getId(), additionalProgress, newProgress);
        return toDto(goalRepo.save(g));
    }

    /**
     * User accepts a community challenge — creates their own personal copy.
     * Increments acceptedCount on the community goal.
     */
    public GoalResponse acceptCommunityGoal(User user, Long communityGoalId) {
        Goal community = goalRepo.findById(communityGoalId)
                .filter(g -> Boolean.TRUE.equals(g.getIsCommunityGoal()))
                .orElseThrow(() -> new RuntimeException("Community goal not found"));

        // Increment accepted count
        community.setAcceptedCount((community.getAcceptedCount() != null ? community.getAcceptedCount() : 0) + 1);
        goalRepo.save(community);

        // Create a personal copy for this user
        Goal personal = Goal.builder()
                .user(user)
                .title(community.getTitle())
                .description(community.getDescription())
                .category(community.getCategory())
                .targetAmount(community.getTargetAmount())
                .deadline(community.getDeadline())
                .currentProgress(0.0)
                .status("ACTIVE")
                .isCommunityGoal(false)
                .build();

        log.info("User {} accepted community goal id={}", user.getId(), communityGoalId);
        return toDto(goalRepo.save(personal));
    }

    /**
     * User rejects a community challenge — only increments rejectedCount.
     */
    public void rejectCommunityGoal(User user, Long communityGoalId) {
        Goal community = goalRepo.findById(communityGoalId)
                .filter(g -> Boolean.TRUE.equals(g.getIsCommunityGoal()))
                .orElseThrow(() -> new RuntimeException("Community goal not found"));
        community.setRejectedCount((community.getRejectedCount() != null ? community.getRejectedCount() : 0) + 1);
        goalRepo.save(community);
        log.info("User {} rejected community goal id={}", user.getId(), communityGoalId);
    }

    public void delete(User user, Long id) {
        Goal g = goalRepo.findById(id)
                .filter(x -> x.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        goalRepo.delete(g);
        log.info("Goal deleted id={} by userId={}", id, user.getId());
    }

    public void checkGoalCompletion(Goal goal) {
        if (goal.getTargetAmount() == null || goal.getTargetAmount() == 0) return;
        double pct = (goal.getCurrentProgress() / goal.getTargetAmount()) * 100;

        if (pct >= 100 && !"COMPLETED".equals(goal.getStatus())) {
            goal.setStatus("COMPLETED");
            log.info("Goal COMPLETED id={} title='{}'", goal.getId(), goal.getTitle());

            String badgeName = switch (goal.getCategory() != null ? goal.getCategory().toLowerCase() : "general") {
                case "transport" -> "Transport Pro";
                case "food"      -> "Green Eater";
                case "energy"    -> "Power Saver";
                default          -> "Goal Getter";
            };
            badgeService.awardBadge(goal.getUser().getId(), badgeName);
            notificationService.notifyGoalCompleted(goal.getUser(), goal.getTitle());
        }
    }

    public List<GoalResponse> getGlobalCommunityGoals() {
        return goalRepo.findByIsCommunityGoalTrueOrderByCreatedAtDesc()
                .stream().map(this::toDto).toList();
    }

    public GoalResponse toDto(Goal g) {
        int pct = (g.getTargetAmount() != null && g.getTargetAmount() > 0)
                ? (int) Math.min((g.getCurrentProgress() / g.getTargetAmount()) * 100, 100) : 0;
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
                .isCommunityGoal(Boolean.TRUE.equals(g.getIsCommunityGoal()))
                .acceptedCount(g.getAcceptedCount() != null ? g.getAcceptedCount() : 0)
                .rejectedCount(g.getRejectedCount() != null ? g.getRejectedCount() : 0)
                .build();
    }
}
