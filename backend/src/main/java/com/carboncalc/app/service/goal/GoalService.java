package com.carboncalc.app.service.goal;

import com.carboncalc.app.dto.goal.GoalCreateRequest;
import com.carboncalc.app.dto.goal.GoalResponse;
import com.carboncalc.app.dto.goal.GoalUpdateRequest;
import com.carboncalc.app.entity.Goal;
import com.carboncalc.app.entity.User;
import com.carboncalc.app.enums.GoalStatus;
import com.carboncalc.app.repository.GoalRepository;
import com.carboncalc.app.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserService userService;

    public GoalResponse createGoal(Long userId, GoalCreateRequest request) {
        User user = userService.getUserEntity(userId);

        Goal goal = Goal.builder()
                .user(user)
                .goalTitle(request.getGoalTitle())
                .targetEmission(request.getTargetEmission())
                .currentEmission(0.0)
                .status(GoalStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        goal = goalRepository.save(goal);
        return toResponse(goal);
    }

    public List<GoalResponse> getGoals(Long userId) {
        User user = userService.getUserEntity(userId);
        return goalRepository.findByUser(user).stream().map(this::toResponse).toList();
    }

    public GoalResponse updateGoal(Long goalId, GoalUpdateRequest request) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        goal.setGoalTitle(request.getGoalTitle());
        goal.setTargetEmission(request.getTargetEmission());
        goal.setCurrentEmission(request.getCurrentEmission());
        goal.setStatus(request.getStatus());

        goal = goalRepository.save(goal);
        return toResponse(goal);
    }

    public void deleteGoal(Long goalId) {
        goalRepository.deleteById(goalId);
    }

    private GoalResponse toResponse(Goal goal) {
        return GoalResponse.builder()
                .id(goal.getId())
                .goalTitle(goal.getGoalTitle())
                .targetEmission(goal.getTargetEmission())
                .currentEmission(goal.getCurrentEmission())
                .status(goal.getStatus())
                .build();
    }
}