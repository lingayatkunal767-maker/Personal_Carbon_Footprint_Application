package com.carboncalc.app.controller;

import com.carboncalc.app.dto.common.ApiResponse;
import com.carboncalc.app.dto.common.MessageResponse;
import com.carboncalc.app.dto.goal.GoalCreateRequest;
import com.carboncalc.app.dto.goal.GoalProgressResponse;
import com.carboncalc.app.dto.goal.GoalResponse;
import com.carboncalc.app.dto.goal.GoalUpdateRequest;
import com.carboncalc.app.service.goal.GoalProgressService;
import com.carboncalc.app.service.goal.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;
    private final GoalProgressService goalProgressService;

    @PostMapping("/{userId}")
    public ApiResponse<GoalResponse> createGoal(@PathVariable Long userId,
                                                @RequestBody GoalCreateRequest request) {
        return ApiResponse.<GoalResponse>builder()
                .success(true)
                .message("Goal created successfully")
                .data(goalService.createGoal(userId, request))
                .build();
    }

    @GetMapping("/{userId}")
    public ApiResponse<List<GoalResponse>> getGoals(@PathVariable Long userId) {
        return ApiResponse.<List<GoalResponse>>builder()
                .success(true)
                .message("Goals fetched successfully")
                .data(goalService.getGoals(userId))
                .build();
    }

    @PutMapping("/{goalId}")
    public ApiResponse<GoalResponse> updateGoal(@PathVariable Long goalId,
                                                @RequestBody GoalUpdateRequest request) {
        return ApiResponse.<GoalResponse>builder()
                .success(true)
                .message("Goal updated successfully")
                .data(goalService.updateGoal(goalId, request))
                .build();
    }

    @DeleteMapping("/{goalId}")
    public ApiResponse<MessageResponse> deleteGoal(@PathVariable Long goalId) {
        goalService.deleteGoal(goalId);
        return ApiResponse.<MessageResponse>builder()
                .success(true)
                .message("Goal deleted successfully")
                .data(MessageResponse.builder().message("Goal deleted").build())
                .build();
    }

    @GetMapping("/{userId}/progress")
    public ApiResponse<List<GoalProgressResponse>> getProgress(@PathVariable Long userId) {
        return ApiResponse.<List<GoalProgressResponse>>builder()
                .success(true)
                .message("Goal progress fetched successfully")
                .data(goalProgressService.getGoalProgress(userId))
                .build();
    }
}