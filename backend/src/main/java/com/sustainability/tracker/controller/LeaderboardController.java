package com.sustainability.tracker.controller;

import com.sustainability.tracker.entity.Leaderboard;
import com.sustainability.tracker.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    // GET /api/leaderboard?limit=10
    @GetMapping
    public List<Leaderboard> getLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        return leaderboardService.getTopLeaderboard(limit);
    }

    // POST /api/leaderboard/refresh  — triggers a materialized view refresh
    @PostMapping("/refresh")
    public String refresh() {
        leaderboardService.refreshLeaderboard();
        return "Leaderboard refreshed successfully.";
    }
}
