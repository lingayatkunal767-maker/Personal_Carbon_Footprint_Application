package com.sustainability.tracker.controller;

import com.sustainability.tracker.entity.Goal;
import com.sustainability.tracker.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    // GET /api/goals/user/{userId}
    @GetMapping("/user/{userId}")
    public List<Goal> getByUser(@PathVariable Long userId) {
        return goalService.getGoalsByUser(userId);
    }

    // POST /api/goals
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Goal create(@RequestBody @Valid Goal goal) {
        return goalService.createGoal(goal);
    }

    // PUT /api/goals/{id}
    @PutMapping("/{id}")
    public Goal update(@PathVariable Long id, @RequestBody @Valid Goal goal) {
        return goalService.updateGoal(id, goal);
    }

    // DELETE /api/goals/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        goalService.deleteGoal(id);
    }
}
