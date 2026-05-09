package com.sustainability.tracker.service;

import com.sustainability.tracker.dto.GoalRequest;
import com.sustainability.tracker.dto.GoalResponse;
import com.sustainability.tracker.entity.CarbonLog;
import com.sustainability.tracker.entity.Goal;
import com.sustainability.tracker.entity.User;
import com.sustainability.tracker.repository.CarbonLogRepository;
import com.sustainability.tracker.repository.GoalRepository;
import com.sustainability.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final CarbonLogRepository carbonLogRepository;
    private final NotificationService notificationService;
    private final BadgeEarningService badgeEarningService;

    public List<GoalResponse> getGoalsByUser(Long userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    public GoalResponse createGoal(GoalRequest request) {
        Long safeUserId = Objects.requireNonNull(request.getUserId(), "request.userId is required");
        User user = userRepository.findById(safeUserId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        Goal goal = new Goal();
        goal.setUser(user);
        goal.setGoalType(normalizeGoalType(request.getGoalType()));
        goal.setTargetValue(request.getTargetValue() != null ? request.getTargetValue() : BigDecimal.valueOf(100));
        goal.setCurrentValue(request.getCurrentValue() != null ? request.getCurrentValue() : BigDecimal.ZERO);
        goal.setDeadline(request.getDeadline());
        goal.setStatus(normalizeStatus(request.getStatus()));

        return toResponse(goalRepository.save(goal));
    }

    public GoalResponse updateGoal(Long id, GoalRequest request) {
        Long safeId = Objects.requireNonNull(id, "id is required");
        Goal existing = goalRepository.findById(safeId)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + id));

        BigDecimal previousCurrent = existing.getCurrentValue() != null ? existing.getCurrentValue() : BigDecimal.ZERO;
        BigDecimal previousTarget = existing.getTargetValue() != null ? existing.getTargetValue() : BigDecimal.ZERO;
        boolean wasCompleted = "completed".equalsIgnoreCase(existing.getStatus());

        if (request.getGoalType() != null) existing.setGoalType(normalizeGoalType(request.getGoalType()));
        if (request.getTargetValue() != null) existing.setTargetValue(request.getTargetValue());
        if (request.getCurrentValue() != null) existing.setCurrentValue(request.getCurrentValue());
        if (request.getDeadline() != null) existing.setDeadline(request.getDeadline());
        if (request.getStatus() != null) existing.setStatus(normalizeStatus(request.getStatus()));

        BigDecimal targetValue = existing.getTargetValue() != null ? existing.getTargetValue() : BigDecimal.ZERO;
        BigDecimal currentValue = existing.getCurrentValue() != null ? existing.getCurrentValue() : BigDecimal.ZERO;

        if (targetValue.compareTo(BigDecimal.ZERO) > 0 && currentValue.compareTo(targetValue) >= 0) {
            existing.setStatus("completed");
        } else if (!"completed".equalsIgnoreCase(existing.getStatus())) {
            existing.setStatus("active");
        }

        boolean isCompleted = "completed".equalsIgnoreCase(existing.getStatus());
        int previousPercentage = calculatePercentage(previousCurrent, previousTarget);
        int currentPercentage = calculatePercentage(currentValue, targetValue);

        Goal saved = goalRepository.save(existing);
        Long userId = saved.getUser().getId();

        if (!wasCompleted && isCompleted) {
            notificationService.notifyGoalCompleted(userId, saved.getGoalType(), saved.getId());
            badgeEarningService.checkAndAwardBadges(userId);
        } else if (!isCompleted && shouldNotifyProgress(previousPercentage, currentPercentage)) {
            notificationService.notifyGoalProgress(userId, saved.getGoalType(), currentPercentage, saved.getId());
        }

        return toResponse(saved);
    }

    public void deleteGoal(Long id) {
        Long safeId = Objects.requireNonNull(id, "id is required");
        if (!goalRepository.existsById(safeId)) {
            throw new RuntimeException("Goal not found with id: " + id);
        }
        goalRepository.deleteById(safeId);
    }

    /**
     * Update goal progress based on carbon logs
     * This is called automatically when new carbon logs are created
     */
    public void updateGoalProgress(Long userId) {
        if (userId == null) {
            log.warn("Skipping goal progress update because userId is null");
            return;
        }

        List<Goal> activeGoals = goalRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(goal -> "active".equalsIgnoreCase(goal.getStatus()))
                .toList();
        
        for (Goal goal : activeGoals) {
            updateSingleGoalProgress(goal);
        }
    }

    /**
     * Update a single goal's progress
     */
    private void updateSingleGoalProgress(Goal goal) {
        if (goal.getUser() == null || goal.getUser().getId() == null) {
            log.warn("Skipping goal progress update for goal {} because user reference is missing", goal.getId());
            return;
        }

        Long userId = goal.getUser().getId();
        LocalDate now = LocalDate.now();
        LocalDate goalStart = goal.getCreatedAt() != null ? goal.getCreatedAt().toLocalDate() : now.minusDays(30);

        List<CarbonLog> logs = carbonLogRepository.findByUserIdAndLogDateBetweenOrderByLogDate(
                userId, goalStart, now
        );

        if (logs.isEmpty()) {
            return;
        }

        BigDecimal currentProgress = BigDecimal.ZERO;
        BigDecimal previousProgress = goal.getCurrentValue() != null ? goal.getCurrentValue() : BigDecimal.ZERO;
        BigDecimal targetValue = safe(goal.getTargetValue());
        String goalType = normalizeGoalType(goal.getGoalType());

        // Calculate progress based on goal type
        switch (goalType) {
            case "reduce_transport":
                currentProgress = calculateCategoryReduction(logs, "transport");
                break;
            case "reduce_food":
                currentProgress = calculateCategoryReduction(logs, "food");
                break;
            case "reduce_energy":
                currentProgress = calculateCategoryReduction(logs, "energy");
                break;
            case "reduce_total":
            case "overall_reduction":
                currentProgress = calculateTotalReduction(logs);
                break;
            case "weekly_target":
                currentProgress = calculateWeeklyProgress(logs);
                break;
            case "monthly_target":
                currentProgress = calculateMonthlyProgress(logs);
                break;
            default:
                // Generic calculation: total emission reduction
                currentProgress = calculateTotalReduction(logs);
        }

        goal.setCurrentValue(currentProgress);

        // Check if goal is completed
        if (targetValue.compareTo(BigDecimal.ZERO) > 0 && currentProgress.compareTo(targetValue) >= 0) {
            if (!"completed".equals(goal.getStatus())) {
                goal.setStatus("completed");
                log.info("🎉 Goal {} completed for user {}", goal.getId(), userId);
                
                // Notify user
                notificationService.notifyGoalCompleted(userId, goal.getGoalType(), goal.getId());
                badgeEarningService.checkAndAwardBadges(userId);
            }
        } else {
            // Send progress notification at milestone percentages (25%, 50%, 75%)
            int previousPercentage = calculatePercentage(previousProgress, targetValue);
            int currentPercentage = calculatePercentage(currentProgress, targetValue);
            
            if (shouldNotifyProgress(previousPercentage, currentPercentage)) {
                notificationService.notifyGoalProgress(userId, goal.getGoalType(), currentPercentage, goal.getId());
            }
        }

        goalRepository.save(goal);
    }

    /**
     * Calculate reduction for specific category
     */
    private BigDecimal calculateCategoryReduction(List<CarbonLog> logs, String category) {
        if (logs.isEmpty()) return BigDecimal.ZERO;

        // Calculate average emission before and after
        int midPoint = logs.size() / 2;
        List<CarbonLog> firstHalf = logs.subList(0, Math.max(1, midPoint));
        List<CarbonLog> secondHalf = logs.subList(midPoint, logs.size());

        BigDecimal avgBefore = calculateCategoryAverage(firstHalf, category);
        BigDecimal avgAfter = calculateCategoryAverage(secondHalf, category);

        BigDecimal reduction = avgBefore.subtract(avgAfter);
        return reduction.max(BigDecimal.ZERO);
    }

    /**
     * Calculate average emission for a category
     */
    private BigDecimal calculateCategoryAverage(List<CarbonLog> logs, String category) {
        if (logs.isEmpty()) return BigDecimal.ZERO;

        BigDecimal sum = logs.stream()
                .map(log -> {
                    switch (category.toLowerCase()) {
                        case "transport":
                            return log.getTransportEmission() != null ? log.getTransportEmission() : BigDecimal.ZERO;
                        case "food":
                            return log.getFoodEmission() != null ? log.getFoodEmission() : BigDecimal.ZERO;
                        case "energy":
                            return log.getEnergyEmission() != null ? log.getEnergyEmission() : BigDecimal.ZERO;
                        default:
                            return BigDecimal.ZERO;
                    }
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return sum.divide(new BigDecimal(logs.size()), 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate total emission reduction
     */
    private BigDecimal calculateTotalReduction(List<CarbonLog> logs) {
        if (logs.isEmpty()) return BigDecimal.ZERO;

        int midPoint = logs.size() / 2;
        List<CarbonLog> firstHalf = logs.subList(0, Math.max(1, midPoint));
        List<CarbonLog> secondHalf = logs.subList(midPoint, logs.size());

        BigDecimal avgBefore = calculateTotalAverage(firstHalf);
        BigDecimal avgAfter = calculateTotalAverage(secondHalf);

        BigDecimal reduction = avgBefore.subtract(avgAfter);
        return reduction.max(BigDecimal.ZERO);
    }

    /**
     * Calculate average total emission
     */
    private BigDecimal calculateTotalAverage(List<CarbonLog> logs) {
        if (logs.isEmpty()) return BigDecimal.ZERO;

        BigDecimal sum = logs.stream()
                .map(log -> log.getTotalEmission() != null ? log.getTotalEmission() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return sum.divide(new BigDecimal(logs.size()), 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate weekly progress (percentage of days logged in current week)
     */
    private BigDecimal calculateWeeklyProgress(List<CarbonLog> logs) {
        LocalDate weekStart = LocalDate.now().minusDays(LocalDate.now().getDayOfWeek().getValue() - 1);
        
        long weeklyLogs = logs.stream()
                .filter(log -> !log.getLogDate().isBefore(weekStart))
                .count();

        return new BigDecimal(weeklyLogs).multiply(new BigDecimal("14.28")); // 7 days = 100%
    }

    /**
     * Calculate monthly progress (percentage of days logged in current month)
     */
    private BigDecimal calculateMonthlyProgress(List<CarbonLog> logs) {
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        
        long monthlyLogs = logs.stream()
                .filter(log -> !log.getLogDate().isBefore(monthStart))
                .count();

        int daysInMonth = monthStart.lengthOfMonth();
        return new BigDecimal(monthlyLogs)
                .multiply(new BigDecimal("100"))
                .divide(new BigDecimal(daysInMonth), 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate percentage
     */
    private int calculatePercentage(BigDecimal current, BigDecimal target) {
        if (target == null || target.compareTo(BigDecimal.ZERO) == 0) return 0;
        
        return safe(current).multiply(new BigDecimal("100"))
                .divide(target, 0, RoundingMode.HALF_UP)
                .intValue();
    }

    /**
     * Check if we should notify about progress (at 25%, 50%, 75% milestones)
     */
    private boolean shouldNotifyProgress(int previousPercentage, int currentPercentage) {
        int[] milestones = {25, 50, 75};
        
        for (int milestone : milestones) {
            if (previousPercentage < milestone && currentPercentage >= milestone) {
                return true;
            }
        }
        
        return false;
    }

    private GoalResponse toResponse(Goal g) {
        return new GoalResponse(
                g.getId(),
                g.getUser().getId(),
                g.getGoalType(),
                g.getTargetValue(),
                g.getCurrentValue(),
                g.getDeadline(),
                g.getStatus(),
                g.getCreatedAt()
        );
    }

    private BigDecimal safe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "active";
        }
        return status.trim().toLowerCase();
    }

    private String normalizeGoalType(String goalType) {
        if (goalType == null || goalType.isBlank()) {
            return "overall_reduction";
        }
        return goalType.trim().toLowerCase();
    }
}
