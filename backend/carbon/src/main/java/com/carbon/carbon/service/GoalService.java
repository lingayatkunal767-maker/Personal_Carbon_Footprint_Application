package com.carbon.carbon.service;

import com.carbon.carbon.dto.GoalDTO;
import com.carbon.carbon.entity.Goal;
import com.carbon.carbon.entity.User;
import com.carbon.carbon.repository.GoalRepository;
import com.carbon.carbon.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final BadgeAwardingService badgeAwardingService;
    private final NotificationService notificationService;

    public GoalService(GoalRepository goalRepository, UserRepository userRepository,
                       BadgeAwardingService badgeAwardingService, NotificationService notificationService) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.badgeAwardingService = badgeAwardingService;
        this.notificationService = notificationService;
    }

    /**
     * Get all goals for a user
     */
    public List<GoalDTO> getUserGoals(Long userId) {
        log.debug("Fetching all goals for user ID: {}", userId);
        
        if (userId == null) {
            log.warn("User ID is required");
            throw new IllegalArgumentException("User ID is required");
        }

        return goalRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get active goals for a user
     */
    public List<GoalDTO> getUserActiveGoals(Long userId) {
        log.debug("Fetching active goals for user ID: {}", userId);
        
        if (userId == null) {
            log.warn("User ID is required");
            throw new IllegalArgumentException("User ID is required");
        }

        return goalRepository.findByUserIdAndStatus(userId, "active")
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get goal by ID
     */
    public GoalDTO getGoalById(Long goalId) {
        log.debug("Fetching goal with ID: {}", goalId);
        
        return goalRepository.findById(goalId)
                .map(this::convertToDTO)
                .orElseThrow(() -> {
                    log.warn("Goal not found with ID: {}", goalId);
                    return new RuntimeException("Goal not found");
                });
    }

    /**
     * Create new goal for a user
     */
    @Transactional
    public GoalDTO createGoal(Long userId, String goalTitle, BigDecimal targetEmission, LocalDateTime startDate, LocalDateTime endDate, String category, String timeframe, String recurrence, String description) {
        log.info("Creating goal for user ID: {} with title: {}", userId, goalTitle);
        
        // Validate inputs
        if (userId == null) {
            log.warn("User ID is required");
            throw new IllegalArgumentException("User ID is required");
        }
        
        if (goalTitle == null || goalTitle.trim().isEmpty()) {
            log.warn("Goal title is required");
            throw new IllegalArgumentException("Goal title is required");
        }
        
        if (targetEmission == null || targetEmission.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("Target emission must be greater than 0");
            throw new IllegalArgumentException("Target emission must be greater than 0");
        }

        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new RuntimeException("User not found");
                });

        Goal goal = new Goal();
        goal.setUser(user);
        goal.setGoalTitle(goalTitle.trim());
        goal.setTargetEmission(targetEmission);
        goal.setCurrentEmission(BigDecimal.ZERO);
        goal.setStatus("active");
        goal.setStartDate(startDate);
        goal.setEndDate(endDate);
        goal.setCategory(category);
        goal.setTimeframe(timeframe);
        goal.setRecurrence(recurrence);
        goal.setDescription(description);

        Goal saved = goalRepository.save(goal);
        log.info("Goal created with ID: {}", saved.getId());
        return convertToDTO(saved);
    }

    /**
     * Update goal progress
     */
    @Transactional
    public GoalDTO updateGoalProgress(Long goalId, BigDecimal emissionIncrease) {
        log.info("Updating goal ID: {} with emission increase: {}", goalId, emissionIncrease);
        
        if (goalId == null) {
            log.warn("Goal ID is required");
            throw new IllegalArgumentException("Goal ID is required");
        }
        
        if (emissionIncrease == null) {
            log.warn("Emission increase is required");
            throw new IllegalArgumentException("Emission increase is required");
        }

        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> {
                    log.warn("Goal not found with ID: {}", goalId);
                    return new RuntimeException("Goal not found");
                });

        // Update current emission
        BigDecimal newEmission = goal.getCurrentEmission().add(emissionIncrease);
        goal.setCurrentEmission(newEmission);

        // Check if goal is completed
        if (newEmission.compareTo(goal.getTargetEmission()) >= 0) {
            goal.setStatus("completed");
            log.info("Goal ID: {} has been completed", goalId);
            notificationService.createNotification(goal.getUser().getId(), "Congratulations! You completed your goal: " + goal.getGoalTitle() + ".", "GOAL");
        }

        Goal updated = goalRepository.save(goal);
        return convertToDTO(updated);
    }

    /**
     * Complete a goal manually
     */
    @Transactional
    public GoalDTO completeGoal(Long goalId) {
        log.info("Completing goal ID: {}", goalId);
        
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> {
                    log.warn("Goal not found with ID: {}", goalId);
                    return new RuntimeException("Goal not found");
                });

        goal.setStatus("completed");
        Goal updated = goalRepository.save(goal);
        log.info("Goal completed successfully");

        // Award goal completion badges
        badgeAwardingService.awardGoalCompletionBadges(goal.getUser().getId());
        
        notificationService.createNotification(goal.getUser().getId(), "Congratulations! You manually completed your goal: " + goal.getGoalTitle() + ".", "GOAL");

        return convertToDTO(updated);
    }

    /**
     * Abandon a goal
     */
    @Transactional
    public GoalDTO abandonGoal(Long goalId) {
        log.info("Abandoning goal ID: {}", goalId);
        
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> {
                    log.warn("Goal not found with ID: {}", goalId);
                    return new RuntimeException("Goal not found");
                });

        goal.setStatus("abandoned");
        Goal updated = goalRepository.save(goal);
        log.info("Goal abandoned successfully");
        return convertToDTO(updated);
    }

    /**
     * Update goal title
     */
    @Transactional
    public GoalDTO updateGoalTitle(Long goalId, String newTitle) {
        log.info("Updating goal title for goal ID: {}", goalId);
        
        if (newTitle == null || newTitle.trim().isEmpty()) {
            log.warn("New title is required");
            throw new IllegalArgumentException("New title is required");
        }

        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> {
                    log.warn("Goal not found with ID: {}", goalId);
                    return new RuntimeException("Goal not found");
                });

        goal.setGoalTitle(newTitle.trim());
        Goal updated = goalRepository.save(goal);
        log.info("Goal title updated successfully");
        return convertToDTO(updated);
    }

    /**
     * Get count of active goals for a user
     */
    public long getActiveGoalCount(Long userId) {
        log.debug("Counting active goals for user ID: {}", userId);
        
        if (userId == null) {
            log.warn("User ID is required");
            throw new IllegalArgumentException("User ID is required");
        }

        return goalRepository.countByUserIdAndStatus(userId, "active");
    }

    /**
     * Get goal activities/progress history
     */
    public List<Map<String, Object>> getGoalActivities(Long goalId) {
        log.debug("Fetching activities for goal ID: {}", goalId);

        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> {
                    log.warn("Goal not found with ID: {}", goalId);
                    return new RuntimeException("Goal not found");
                });

        List<Map<String, Object>> activities = new ArrayList<>();

        // Add goal creation activity
        Map<String, Object> creation = new HashMap<>();
        creation.put("date", goal.getCreatedAt());
        creation.put("action", "Goal Created");
        creation.put("description", "Set target: " + goal.getTargetEmission() + " kg CO2");
        activities.add(creation);

        // Add progress updates (mock for now, can be enhanced with actual progress logs)
        if (goal.getCurrentEmission().compareTo(BigDecimal.ZERO) > 0) {
            Map<String, Object> progress = new HashMap<>();
            progress.put("date", LocalDateTime.now());
            progress.put("action", "Progress Update");
            progress.put("description", "Current emission: " + goal.getCurrentEmission() + " kg CO2");
            activities.add(progress);
        }

        // Add completion if applicable
        if ("completed".equals(goal.getStatus())) {
            Map<String, Object> completion = new HashMap<>();
            completion.put("date", LocalDateTime.now());
            completion.put("action", "Goal Completed");
            completion.put("description", "Target achieved!");
            activities.add(completion);
        }

        return activities;
    }

    /**
     * Convert entity to DTO with progress percentage
     */
    private GoalDTO convertToDTO(Goal goal) {
        double progressPercentage = 0;
        if (goal.getTargetEmission().compareTo(BigDecimal.ZERO) > 0) {
            progressPercentage = (goal.getCurrentEmission().doubleValue() / goal.getTargetEmission().doubleValue()) * 100;
            progressPercentage = Math.min(progressPercentage, 100); // Cap at 100%
        }

        return new GoalDTO(
                goal.getId(),
                goal.getUser().getId(),
                goal.getGoalTitle(),
                goal.getTargetEmission(),
                goal.getCurrentEmission(),
                goal.getStatus(),
                goal.getCreatedAt(),
                goal.getStartDate(),
                goal.getEndDate(),
                goal.getCategory(),
                goal.getTimeframe(),
                goal.getRecurrence(),
                goal.getDescription(),
                goal.getGoalType(),
                progressPercentage
        );
    }
}
