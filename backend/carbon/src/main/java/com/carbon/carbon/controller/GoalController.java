package com.carbon.carbon.controller;

import com.carbon.carbon.dto.GoalDTO;
import com.carbon.carbon.service.GoalService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/goals")
@CrossOrigin
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    /**
     * Get all goals for a user
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getUserGoals(@PathVariable Long userId) {
        try {
            List<GoalDTO> goals = goalService.getUserGoals(userId);
            return ResponseEntity.ok(goals);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid user ID: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching user goals", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch goals"));
        }
    }

    /**
     * Get active goals for a user
     */
    @GetMapping("/user/{userId}/active")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getUserActiveGoals(@PathVariable Long userId) {
        try {
            List<GoalDTO> goals = goalService.getUserActiveGoals(userId);
            return ResponseEntity.ok(goals);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid user ID: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching active goals", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch active goals"));
        }
    }

    /**
     * Get goal by ID
     */
    @GetMapping("/{goalId}")
    public ResponseEntity<?> getGoalById(@PathVariable Long goalId) {
        try {
            GoalDTO goal = goalService.getGoalById(goalId);
            return ResponseEntity.ok(goal);
        } catch (RuntimeException e) {
            log.warn("Goal not found: {}", goalId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Goal not found"));
        } catch (Exception e) {
            log.error("Error fetching goal", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch goal"));
        }
    }

    /**
     * Create new goal
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> createGoal(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String goalTitle = request.get("goalTitle").toString();
            BigDecimal targetEmission = new BigDecimal(request.get("targetEmission").toString());
            LocalDateTime startDate = request.get("startDate") != null ? parseDate(request.get("startDate").toString()) : null;
            LocalDateTime endDate = request.get("endDate") != null ? parseDate(request.get("endDate").toString()) : null;
            String category = request.get("category") != null ? request.get("category").toString() : null;
            String timeframe = request.get("timeframe") != null ? request.get("timeframe").toString() : null;
            String recurrence = request.get("recurrence") != null ? request.get("recurrence").toString() : null;
            String description = request.get("description") != null ? request.get("description").toString() : null;

            GoalDTO goal = goalService.createGoal(userId, goalTitle, targetEmission, startDate, endDate, category, timeframe, recurrence, description);
            return ResponseEntity.status(HttpStatus.CREATED).body(goal);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid input for goal creation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            log.warn("Error creating goal: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating goal", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create goal"));
        }
    }

    /**
     * Update goal progress
     */
    @PutMapping("/{goalId}/progress")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateGoalProgress(
            @PathVariable Long goalId,
            @RequestBody Map<String, BigDecimal> request) {
        try {
            BigDecimal emissionIncrease = request.get("emissionIncrease");
            GoalDTO goal = goalService.updateGoalProgress(goalId, emissionIncrease);
            return ResponseEntity.ok(goal);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid input for goal update: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            log.warn("Error updating goal: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating goal progress", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update goal"));
        }
    }

    /**
     * Complete a goal
     */
    @PutMapping("/{goalId}/complete")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> completeGoal(@PathVariable Long goalId) {
        try {
            GoalDTO goal = goalService.completeGoal(goalId);
            return ResponseEntity.ok(goal);
        } catch (RuntimeException e) {
            log.warn("Error completing goal {}: {}", goalId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error completing goal", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to complete goal"));
        }
    }

    /**
     * Abandon a goal
     */
    @PutMapping("/{goalId}/abandon")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> abandonGoal(@PathVariable Long goalId) {
        try {
            GoalDTO goal = goalService.abandonGoal(goalId);
            return ResponseEntity.ok(goal);
        } catch (RuntimeException e) {
            log.warn("Error abandoning goal {}: {}", goalId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error abandoning goal", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to abandon goal"));
        }
    }

    /**
     * Update goal title
     */
    @PutMapping("/{goalId}/title")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> updateGoalTitle(
            @PathVariable Long goalId,
            @RequestBody Map<String, String> request) {
        try {
            String newTitle = request.get("newTitle");
            GoalDTO goal = goalService.updateGoalTitle(goalId, newTitle);
            return ResponseEntity.ok(goal);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid title: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            log.warn("Goal not found: {}", goalId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Goal not found"));
        } catch (Exception e) {
            log.error("Error updating goal title", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update goal title"));
        }
    }

    /**
     * Get active goal count for a user
     */
    @GetMapping("/user/{userId}/count")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getActiveGoalCount(@PathVariable Long userId) {
        try {
            long count = goalService.getActiveGoalCount(userId);
            return ResponseEntity.ok(Map.of("userId", userId, "activeGoalCount", count));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid user ID: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error counting active goals", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to count goals"));
        }
    }

    /**
     * Get goal activities/progress history
     */
    @GetMapping("/{goalId}/activities")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getGoalActivities(@PathVariable Long goalId) {
        try {
            List<Map<String, Object>> activities = goalService.getGoalActivities(goalId);
            return ResponseEntity.ok(activities);
        } catch (RuntimeException e) {
            log.warn("Goal not found: {}", goalId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Goal not found"));
        } catch (Exception e) {
            log.error("Error fetching goal activities", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch goal activities"));
        }
    }

    private LocalDateTime parseDate(String dateStr) {
        try {
            return OffsetDateTime.parse(dateStr).toLocalDateTime();
        } catch (DateTimeParseException e) {
            return LocalDateTime.parse(dateStr);
        }
    }
}
