package com.carboncalc.app.controller;

import com.carboncalc.app.dto.common.ApiResponse;
import com.carboncalc.app.dto.leaderboard.LeaderboardResponse;
import com.carboncalc.app.service.leaderboard.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ApiResponse<LeaderboardResponse> getLeaderboard() {
        return ApiResponse.<LeaderboardResponse>builder()
                .success(true)
                .message("Leaderboard fetched successfully")
                .data(leaderboardService.getLeaderboard())
                .build();
    }
}