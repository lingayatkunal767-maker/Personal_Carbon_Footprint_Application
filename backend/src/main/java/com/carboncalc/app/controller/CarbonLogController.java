package com.carboncalc.app.controller;

import com.carboncalc.app.dto.carbon.CarbonLogDetailResponse;
import com.carboncalc.app.dto.carbon.CarbonLogResponse;
import com.carboncalc.app.dto.common.ApiResponse;
import com.carboncalc.app.service.carbon.CarbonHistoryService;
import com.carboncalc.app.service.carbon.CarbonLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/carbon/logs")
@RequiredArgsConstructor
public class CarbonLogController {

    private final CarbonLogService carbonLogService;
    private final CarbonHistoryService carbonHistoryService;

    @GetMapping("/{userId}")
    public ApiResponse<List<CarbonLogResponse>> getLogs(@PathVariable Long userId) {
        return ApiResponse.<List<CarbonLogResponse>>builder()
                .success(true)
                .message("Carbon logs fetched successfully")
                .data(carbonLogService.getLogs(userId))
                .build();
    }

    @GetMapping("/detail/{logId}")
    public ApiResponse<CarbonLogDetailResponse> getLogDetail(@PathVariable Long logId) {
        return ApiResponse.<CarbonLogDetailResponse>builder()
                .success(true)
                .message("Carbon log detail fetched successfully")
                .data(carbonLogService.getLogDetail(logId))
                .build();
    }

    @GetMapping("/{userId}/filter")
    public ApiResponse<List<CarbonLogResponse>> getHistory(@PathVariable Long userId,
                                                           @RequestParam LocalDate from,
                                                           @RequestParam LocalDate to) {
        return ApiResponse.<List<CarbonLogResponse>>builder()
                .success(true)
                .message("Filtered carbon logs fetched successfully")
                .data(carbonHistoryService.getHistory(userId, from, to))
                .build();
    }
}