package com.sustainability.tracker.service;

import com.sustainability.tracker.dto.GoalRequest;
import com.sustainability.tracker.dto.GoalResponse;
import com.sustainability.tracker.entity.Goal;
import com.sustainability.tracker.entity.User;
import com.sustainability.tracker.repository.GoalRepository;
import com.sustainability.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public List<GoalResponse> getGoalsByUser(Long userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public GoalResponse createGoal(GoalRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        Goal goal = new Goal();
        goal.setUser(user);
        goal.setGoalType(request.getGoalType());
        goal.setTargetValue(request.getTargetValue() != null ? request.getTargetValue() : BigDecimal.valueOf(100));
        goal.setCurrentValue(request.getCurrentValue() != null ? request.getCurrentValue() : BigDecimal.ZERO);
        goal.setDeadline(request.getDeadline());
        goal.setStatus(request.getStatus() != null ? request.getStatus() : "active");

        return toResponse(goalRepository.save(goal));
    }

    public GoalResponse updateGoal(Long id, GoalRequest request) {
        Goal existing = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + id));
        if (request.getGoalType() != null) existing.setGoalType(request.getGoalType());
        if (request.getTargetValue() != null) existing.setTargetValue(request.getTargetValue());
        if (request.getCurrentValue() != null) existing.setCurrentValue(request.getCurrentValue());
        if (request.getDeadline() != null) existing.setDeadline(request.getDeadline());
        if (request.getStatus() != null) existing.setStatus(request.getStatus());
        return toResponse(goalRepository.save(existing));
    }

    public void deleteGoal(Long id) {
        if (!goalRepository.existsById(id)) {
            throw new RuntimeException("Goal not found with id: " + id);
        }
        goalRepository.deleteById(id);
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
}
