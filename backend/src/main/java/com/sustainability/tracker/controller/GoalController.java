package com.sustainability.tracker.controller;

import com.sustainability.tracker.dto.GoalRequest;
import com.sustainability.tracker.dto.GoalResponse;
import com.sustainability.tracker.service.GoalService;
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
    public List<GoalResponse> getByUser(@PathVariable Long userId) {
        return goalService.getGoalsByUser(userId);
    }

    // POST /api/goals
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GoalResponse create(@RequestBody GoalRequest request) {
        return goalService.createGoal(request);
    }

    // PUT /api/goals/{id}
    @PutMapping("/{id}")
    public GoalResponse update(@PathVariable Long id, @RequestBody GoalRequest request) {
        return goalService.updateGoal(id, request);
    }

    // DELETE /api/goals/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        goalService.deleteGoal(id);
    }
}
