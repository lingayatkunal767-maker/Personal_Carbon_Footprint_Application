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
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public GoalService(GoalRepository goalRepository, UserRepository userRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
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
    public GoalDTO createGoal(Long userId, String goalTitle, BigDecimal targetEmission) {
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
                progressPercentage
        );
    }
}
