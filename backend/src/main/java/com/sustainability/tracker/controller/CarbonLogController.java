package com.sustainability.tracker.controller;

import com.sustainability.tracker.dto.CarbonLogResponse;
import com.sustainability.tracker.service.CarbonLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/carbon/logs")
@RequiredArgsConstructor
public class CarbonLogController {

    private final CarbonLogService carbonLogService;

    // In a real app, userId would come from @AuthenticationPrincipal
    @GetMapping
    public List<CarbonLogResponse> getCarbonLogs(
            @RequestParam Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return carbonLogService.getCarbonLogs(userId, from, to);
    }
}
