package com.sustainability.tracker.service;

import com.sustainability.tracker.entity.Goal;
import com.sustainability.tracker.entity.User;
import com.sustainability.tracker.repository.GoalRepository;
import com.sustainability.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public List<Goal> getGoalsByUser(Long userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Goal createGoal(Goal goal) {
        Long userId = goal.getUser().getId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        goal.setUser(user);
        return goalRepository.save(goal);
    }

    public Goal updateGoal(Long id, Goal updatedGoal) {
        Goal existing = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + id));
        existing.setGoalType(updatedGoal.getGoalType());
        existing.setTargetValue(updatedGoal.getTargetValue());
        existing.setCurrentValue(updatedGoal.getCurrentValue());
        existing.setDeadline(updatedGoal.getDeadline());
        existing.setStatus(updatedGoal.getStatus());
        return goalRepository.save(existing);
    }

    public void deleteGoal(Long id) {
        if (!goalRepository.existsById(id)) {
            throw new RuntimeException("Goal not found with id: " + id);
        }
        goalRepository.deleteById(id);
    }
}
