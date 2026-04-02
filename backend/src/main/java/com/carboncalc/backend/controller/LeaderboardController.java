package com.carboncalc.backend.controller;

import com.carboncalc.backend.dto.LeaderboardResponse;
import com.carboncalc.backend.repository.UserRepository;
import com.carboncalc.backend.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<LeaderboardResponse>> getLeaderboard() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Long userId = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found")).getId();
        return ResponseEntity.ok(leaderboardService.getLeaderboard(userId));
    }
}
