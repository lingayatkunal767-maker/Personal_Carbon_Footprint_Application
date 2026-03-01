
package com.carbon.carbontracker.service;

import com.carbon.carbontracker.dto.GoalRequest;
import com.carbon.carbontracker.dto.GoalResponse;
import com.carbon.carbontracker.model.Goal;
import com.carbon.carbontracker.model.Goal.GoalStatus;
import com.carbon.carbontracker.model.User;
import com.carbon.carbontracker.repository.GoalRepository;
import com.carbon.carbontracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    // ---------------------------------------------------------------
    // Create a new goal for a user
    // ---------------------------------------------------------------
    public GoalResponse createGoal(Long userId, GoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Goal goal = Goal.builder()
                .user(user)
                .goalTitle(request.getGoalTitle())
                .targetEmission(request.getTargetEmission())
                .currentEmission(request.getCurrentEmission())
                .status(request.getStatus() != null ? request.getStatus() : GoalStatus.ACTIVE)
                .build();

        Goal saved = goalRepository.save(goal);
        return toResponse(saved);
    }

    // ---------------------------------------------------------------
    // List all goals for a user
    // ---------------------------------------------------------------
    public List<GoalResponse> getGoalsByUser(Long userId) {
        return goalRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    // List goals filtered by status
    // ---------------------------------------------------------------
    public List<GoalResponse> getGoalsByUserAndStatus(Long userId, GoalStatus status) {
        return goalRepository.findByUserIdAndStatus(userId, status)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    // Update an existing goal
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
        return toResponse(updated);
    }

    // ---------------------------------------------------------------
    // Delete a goal
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
    // Mapping helper
    // ---------------------------------------------------------------
    private GoalResponse toResponse(Goal goal) {
        return GoalResponse.builder()
                .id(goal.getId())
                .userId(goal.getUser().getId())
                .goalTitle(goal.getGoalTitle())
                .targetEmission(goal.getTargetEmission())
                .currentEmission(goal.getCurrentEmission())
                .status(goal.getStatus())
                .createdAt(goal.getCreatedAt())
                .build();
    }
}
