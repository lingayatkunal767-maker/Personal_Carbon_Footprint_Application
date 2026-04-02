package com.carboncalc.backend.controller;

import com.carboncalc.backend.dto.GoalRequest;
import com.carboncalc.backend.dto.GoalResponse;
import com.carboncalc.backend.security.JwtService;
import com.carboncalc.backend.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(
            @Valid @RequestBody GoalRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(goalService.createGoal(req, currentUserId()));
    }

    @GetMapping
    public ResponseEntity<List<GoalResponse>> getGoals() {
        return ResponseEntity.ok(goalService.getUserGoals(currentUserId()));
    }

    @PutMapping("/{goalId}")
    public ResponseEntity<GoalResponse> updateGoal(
            @PathVariable Long goalId,
            @Valid @RequestBody GoalRequest req) {
        return ResponseEntity.ok(goalService.updateGoal(goalId, req, currentUserId()));
    }

    @DeleteMapping("/{goalId}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long goalId) {
        goalService.deleteGoal(goalId, currentUserId());
        return ResponseEntity.noContent().build();
    }

    /** Extract userId from the SecurityContext (set by JwtAuthenticationFilter) */
    private Long currentUserId() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return jwtService.extractUserIdByEmail(email);
    }
}
