package com.sustainability.tracker.controller;

import com.sustainability.tracker.dto.EmissionsBreakdownDTO;
import com.sustainability.tracker.dto.MonthlyStatsDTO;
import com.sustainability.tracker.dto.StatsDTO;
import com.sustainability.tracker.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    // GET /api/stats/user/{userId}
    @GetMapping("/user/{userId}")
    public StatsDTO getUserStats(@PathVariable Long userId) {
        return statsService.getUserStats(userId);
    }

    // GET /api/stats/user/{userId}/monthly?months=6
    @GetMapping("/user/{userId}/monthly")
    public List<MonthlyStatsDTO> getMonthlyComparison(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "6") int months) {
        return statsService.getMonthlyComparison(userId, months);
    }

    // GET /api/stats/user/{userId}/breakdown
    @GetMapping("/user/{userId}/breakdown")
    public List<EmissionsBreakdownDTO> getBreakdown(@PathVariable Long userId) {
        return statsService.getEmissionsBreakdown(userId);
    }
}
