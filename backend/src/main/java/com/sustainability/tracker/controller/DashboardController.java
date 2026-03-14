package com.sustainability.tracker.controller;

import com.sustainability.tracker.dto.DashboardDTO;
import com.sustainability.tracker.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/user/{userId}")
    public DashboardDTO getDashboard(@PathVariable Long userId) {
        return dashboardService.getDashboardData(userId);
    }
}
