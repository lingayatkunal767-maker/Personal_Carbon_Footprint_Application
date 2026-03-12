package com.ecotrack.backend.service;

import com.ecotrack.backend.dto.GoalRequest;
import com.ecotrack.backend.dto.GoalResponse;
import com.ecotrack.backend.entity.Goal;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {
    private final GoalRepository repo;

    public List<GoalResponse> getAll(User user) {
        return repo.findByUserOrderByCreatedAtDesc(user).stream().map(this::toDto).toList();
    }

    public GoalResponse create(User user, GoalRequest req) {
        Goal g = Goal.builder().user(user).title(req.getTitle()).description(req.getDescription())
            .category(req.getCategory()).targetAmount(req.getTargetAmount()).deadline(req.getDeadline()).build();
        return toDto(repo.save(g));
    }

    public GoalResponse updateProgress(User user, Long id, Double progress) {
        Goal g = repo.findById(id).filter(x -> x.getUser().getId().equals(user.getId()))
            .orElseThrow(() -> new RuntimeException("Goal not found"));
        g.setCurrentProgress(progress);
        if (progress >= g.getTargetAmount()) g.setStatus("COMPLETED");
        return toDto(repo.save(g));
    }

    public void delete(User user, Long id) {
        Goal g = repo.findById(id).filter(x -> x.getUser().getId().equals(user.getId()))
            .orElseThrow(() -> new RuntimeException("Goal not found"));
        repo.delete(g);
    }

    private GoalResponse toDto(Goal g) {
        int pct = g.getTargetAmount() > 0 ? (int) Math.min((g.getCurrentProgress() / g.getTargetAmount()) * 100, 100) : 0;
        return GoalResponse.builder().id(g.getId()).title(g.getTitle()).description(g.getDescription())
            .category(g.getCategory()).targetAmount(g.getTargetAmount()).currentProgress(g.getCurrentProgress())
            .progressPercentage(pct).deadline(g.getDeadline()).status(g.getStatus()).createdAt(g.getCreatedAt()).build();
    }
}
