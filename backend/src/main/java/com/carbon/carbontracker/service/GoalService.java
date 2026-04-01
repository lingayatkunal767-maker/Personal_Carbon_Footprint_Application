package com.carbon.carbontracker.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import com.carbon.carbontracker.dto.GoalRequest;
import com.carbon.carbontracker.dto.GoalResponse;
import com.carbon.carbontracker.model.Goal;
import com.carbon.carbontracker.model.Goal.GoalStatus;
import com.carbon.carbontracker.model.User;
import com.carbon.carbontracker.repository.GoalRepository;
import com.carbon.carbontracker.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BadgeRuleService badgeRuleService;

    // ---------------------------------------------------------------
    // Create a new goal
    // ---------------------------------------------------------------
    public GoalResponse createGoal(Long userId, GoalRequest request) {

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

    // Temporary baseline emission (example value)
    BigDecimal baselineEmission = BigDecimal.valueOf(100);

    BigDecimal targetEmission = null;

    if (request.getReductionTarget() != null) {

        BigDecimal reduction =
                baselineEmission.multiply(
                        BigDecimal.valueOf(request.getReductionTarget())
                                .divide(BigDecimal.valueOf(100))
                );

        targetEmission = baselineEmission.subtract(reduction);
    }

    Goal goal = Goal.builder()
            .user(user)
            .goalTitle(request.getGoalTitle())
            .category(request.getCategory())
            .reductionTarget(request.getReductionTarget())
            .timeframe(request.getTimeframe())
            .description(request.getDescription())
            .targetEmission(targetEmission)
            .currentEmission(BigDecimal.ZERO)
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .status(request.getStatus() != null ? request.getStatus() : GoalStatus.ACTIVE)
            .progressPercentage(0.0)
            .build();

    Goal saved = goalRepository.save(goal);

    // Badge rule: first goal created
    badgeRuleService.afterGoalCreated(userId);

    return toResponse(saved);
}

    // ---------------------------------------------------------------
    // List all goals for a user
    // ---------------------------------------------------------------
    public List<GoalResponse> getGoalsByUser(Long userId) {

        return goalRepository.findByUser_Id(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    // List all goals for non-admin users (for admin dashboard)
    // ---------------------------------------------------------------
    public List<GoalResponse> getAllNonAdminGoals() {
        return goalRepository.findAll()
                .stream()
                .filter(goal -> {
                    String role = goal.getUser() != null ? goal.getUser().getRole() : null;
                    if (role == null) return true;
                    String r = role.trim().toLowerCase();
                    return !r.contains("admin");
                })
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    // List goals by status
    // ---------------------------------------------------------------
    public List<GoalResponse> getGoalsByUserAndStatus(Long userId, GoalStatus status) {

        return goalRepository.findByUser_IdAndStatus(userId, status)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    // Update goal
    // ---------------------------------------------------------------
    public GoalResponse updateGoal(Long goalId, Long userId, GoalRequest request) {

        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found: " + goalId));

        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this goal");
        }

        if (request.getGoalTitle() != null) {
            goal.setGoalTitle(request.getGoalTitle());
        }

        if (request.getTargetEmission() != null) {
            goal.setTargetEmission(request.getTargetEmission());
        }

        if (request.getCurrentEmission() != null) {
            goal.setCurrentEmission(request.getCurrentEmission());
        }

        if (request.getStatus() != null) {
            goal.setStatus(request.getStatus());
        }

        Goal updated = goalRepository.save(goal);

        // Badge rule: goal potentially completed
        badgeRuleService.afterGoalStatusUpdated(userId, updated.getStatus());

        return toResponse(updated);
    }

    // ---------------------------------------------------------------
    // Delete goal
    // ---------------------------------------------------------------
    public void deleteGoal(Long goalId, Long userId) {

        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found: " + goalId));

        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this goal");
        }

        goalRepository.delete(goal);
    }

    // ---------------------------------------------------------------
    // Convert entity to response DTO
    // ---------------------------------------------------------------
    private GoalResponse toResponse(Goal goal) {

        return GoalResponse.builder()
                .id(goal.getId())
                .userId(goal.getUser().getId())
                .userName(goal.getUser().getName() != null ? goal.getUser().getName() : goal.getUser().getEmail())
                .goalTitle(goal.getGoalTitle())
                .category(goal.getCategory())
                .reductionTarget(goal.getReductionTarget())
                .timeframe(goal.getTimeframe())
                .description(goal.getDescription())
                .targetEmission(goal.getTargetEmission())
                .currentEmission(goal.getCurrentEmission())
                .progressPercentage(goal.getProgressPercentage())
                .status(goal.getStatus())
                .createdAt(goal.getCreatedAt())
                .endDate(goal.getEndDate())
                .build();
    }

    // ---------------------------------------------------------------
    // Automatically update goals when carbon log changes
    // ---------------------------------------------------------------
    public void updateGoalsForUser(
        Long userId,
        BigDecimal transportEmission,
        BigDecimal foodEmission,
        BigDecimal energyEmission) {

    List<Goal> goals =
            goalRepository.findByUser_IdAndStatus(userId, GoalStatus.ACTIVE);

    LocalDate today = LocalDate.now();

    for (Goal goal : goals) {

        if (goal.getStartDate() != null && goal.getStartDate().isAfter(today)) {
            continue;
        }

        if (goal.getEndDate() != null && goal.getEndDate().isBefore(today)) {
            continue;
        }

        BigDecimal emissionToAdd = BigDecimal.ZERO;

        if (goal.getCategory() != null) {

            switch (goal.getCategory().toLowerCase()) {

                case "transport":
                    emissionToAdd = transportEmission;
                    break;

                case "food":
                    emissionToAdd = foodEmission;
                    break;

                case "energy":
                    emissionToAdd = energyEmission;
                    break;
            }
        }

        BigDecimal current = goal.getCurrentEmission();

        if (current == null) {
            current = BigDecimal.ZERO;
        }

        current = current.add(emissionToAdd);

        if (current.compareTo(BigDecimal.ZERO) < 0) {
            current = BigDecimal.ZERO;
        }

        goal.setCurrentEmission(current);

        BigDecimal target = goal.getTargetEmission();

        if (target != null && target.compareTo(BigDecimal.ZERO) > 0) {

            // Progress is how much of the target emission "budget" has been used.
            // 0% at 0, 100% when current >= target.
            double progress =
                    current.divide(target, 4, java.math.RoundingMode.HALF_UP)
                            .doubleValue() * 100;

            if (progress < 0) progress = 0;
            if (progress > 100) progress = 100;

            goal.setProgressPercentage(progress);

            // Mark goal completed once target is reached or exceeded.
            if (current.compareTo(target) >= 0) {
                goal.setStatus(GoalStatus.COMPLETED);
                // Trigger badge rules when goal is auto-completed from emissions update
                badgeRuleService.afterGoalStatusUpdated(userId, GoalStatus.COMPLETED);
            }
        }

        goalRepository.save(goal);
    }
}
}
