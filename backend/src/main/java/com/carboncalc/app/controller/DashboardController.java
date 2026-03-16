package com.carboncalc.app.controller;

import com.carboncalc.app.dto.carbon.CategoryBreakdownResponse;
import com.carboncalc.app.dto.carbon.DashboardSummaryResponse;
import com.carboncalc.app.dto.common.ApiResponse;
import com.carboncalc.app.service.carbon.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/{userId}/summary")
    public ApiResponse<DashboardSummaryResponse> getSummary(@PathVariable Long userId) {
        return ApiResponse.<DashboardSummaryResponse>builder()
                .success(true)
                .message("Dashboard summary fetched successfully")
                .data(dashboardService.getSummary(userId))
                .build();
    }

    @GetMapping("/{userId}/breakdown")
    public ApiResponse<CategoryBreakdownResponse> getBreakdown(@PathVariable Long userId) {
        return ApiResponse.<CategoryBreakdownResponse>builder()
                .success(true)
                .message("Category breakdown fetched successfully")
                .data(dashboardService.getCategoryBreakdown(userId))
                .build();
    }
}