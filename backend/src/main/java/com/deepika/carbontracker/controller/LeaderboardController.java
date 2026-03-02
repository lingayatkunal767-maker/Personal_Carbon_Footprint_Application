package com.deepika.carbontracker.controller;

import com.deepika.carbontracker.dto.LeaderboardRequest;
import com.deepika.carbontracker.dto.LeaderboardResponse;
import com.deepika.carbontracker.model.User;
import com.deepika.carbontracker.repository.UserRepository;
import com.deepika.carbontracker.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    @Autowired
    private LeaderboardService leaderboardService;

    @Autowired
    private UserRepository userRepository;

    // ------------------------------------------------------------------
    // Helper — resolve the currently authenticated user's ID from JWT
    // ------------------------------------------------------------------
    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        return user.getId();
    }

    // GET /api/leaderboard — global ranked leaderboard (all users)
    @GetMapping
    public ResponseEntity<List<LeaderboardResponse>> getLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getLeaderboard());
    }

    // GET /api/leaderboard/me — logged-in user's own entries
    @GetMapping("/me")
    public ResponseEntity<List<LeaderboardResponse>> getMyEntries() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(leaderboardService.getMyEntries(userId));
    }

    // POST /api/leaderboard — submit or update score for logged-in user
    @PostMapping
    public ResponseEntity<?> submitScore(@RequestBody LeaderboardRequest request) {
        Long userId = getCurrentUserId();
        try {
            LeaderboardResponse response = leaderboardService.submitScore(userId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
