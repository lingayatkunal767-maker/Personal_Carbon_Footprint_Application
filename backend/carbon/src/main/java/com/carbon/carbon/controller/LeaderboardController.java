package com.carbon.carbon.controller;

import com.carbon.carbon.dto.LeaderboardDTO;
import com.carbon.carbon.service.LeaderboardService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    /**
     * Get all leaderboard entries sorted by score
     */
    @GetMapping
    public ResponseEntity<?> getAllLeaderboards() {
        try {
            List<LeaderboardDTO> leaderboards = leaderboardService.getAllLeaderboards();
            return ResponseEntity.ok(leaderboards);
        } catch (Exception e) {
            log.error("Error fetching leaderboards", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch leaderboards"));
        }
    }

    /**
     * Get top N leaderboard users
     */
    @GetMapping("/top/{limit}")
    public ResponseEntity<?> getTopLeaderboards(@PathVariable int limit) {
        try {
            List<LeaderboardDTO> leaderboards = leaderboardService.getTopLeaderboardUsers(limit);
            return ResponseEntity.ok(leaderboards);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid limit parameter: {}", limit);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Limit must be greater than 0"));
        } catch (Exception e) {
            log.error("Error fetching top leaderboards", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch leaderboards"));
        }
    }

    /**
     * Get leaderboard entry for current user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserLeaderboard(@PathVariable Long userId) {
        try {
            LeaderboardDTO leaderboard = leaderboardService.getUserLeaderboard(userId);
            return ResponseEntity.ok(leaderboard);
        } catch (RuntimeException e) {
            log.warn("Leaderboard entry not found for user: {}", userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Leaderboard entry not found"));
        } catch (Exception e) {
            log.error("Error fetching user leaderboard", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch user leaderboard"));
        }
    }

    /**
     * Initialize leaderboard entry for a user
     */
    @PostMapping("/initialize/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> initializeLeaderboard(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        try {
            String teamName = request.get("teamName");
            LeaderboardDTO leaderboard = leaderboardService.initializeUserLeaderboard(userId, teamName);
            return ResponseEntity.status(HttpStatus.CREATED).body(leaderboard);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid input for leaderboard initialization: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            log.warn("Error initializing leaderboard: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error initializing leaderboard", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to initialize leaderboard"));
        }
    }

    /**
     * Update user score
     */
    @PutMapping("/user/{userId}/score")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserScore(
            @PathVariable Long userId,
            @RequestBody Map<String, BigDecimal> request) {
        try {
            BigDecimal scoreIncrease = request.get("scoreIncrease");
            LeaderboardDTO leaderboard = leaderboardService.updateUserScore(userId, scoreIncrease);
            return ResponseEntity.ok(leaderboard);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid input for score update: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            log.warn("Error updating score: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating user score", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update user score"));
        }
    }

    /**
     * Change user's team
     */
    @PutMapping("/user/{userId}/team")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> changeUserTeam(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        try {
            String teamName = request.get("teamName");
            LeaderboardDTO leaderboard = leaderboardService.changeUserTeam(userId, teamName);
            return ResponseEntity.ok(leaderboard);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid team name: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            log.warn("Error changing team: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error changing user team", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to change user team"));
        }
    }
}
