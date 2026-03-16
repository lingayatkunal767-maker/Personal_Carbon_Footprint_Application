package com.carboncalc.app.service.goal;

import com.carboncalc.app.dto.goal.GoalProgressResponse;
import com.carboncalc.app.entity.Goal;
import com.carboncalc.app.entity.User;
import com.carboncalc.app.repository.CarbonLogRepository;
import com.carboncalc.app.repository.GoalRepository;
import com.carboncalc.app.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalProgressService {

    private final GoalRepository goalRepository;
    private final CarbonLogRepository carbonLogRepository;
    private final UserService userService;

    public List<GoalProgressResponse> getGoalProgress(Long userId) {
        User user = userService.getUserEntity(userId);

        double latestEmission = carbonLogRepository.findByUser(user)
                .stream()
                .reduce((first, second) -> second)
                .map(log -> log.getTotalEmission() == null ? 0.0 : log.getTotalEmission())
                .orElse(0.0);

        return goalRepository.findByUser(user)
                .stream()
                .map(goal -> buildProgress(goal, latestEmission))
                .toList();
    }

    private GoalProgressResponse buildProgress(Goal goal, double latestEmission) {
        double target = goal.getTargetEmission() == null ? 0.0 : goal.getTargetEmission();
        double progress = target == 0.0 ? 0.0 : Math.max(0, ((target - latestEmission) / target) * 100);

        return GoalProgressResponse.builder()
                .goalId(goal.getId())
                .goalTitle(goal.getGoalTitle())
                .targetEmission(target)
                .currentEmission(latestEmission)
                .progressPercentage(Math.round(progress * 100.0) / 100.0)
                .build();
    }
}