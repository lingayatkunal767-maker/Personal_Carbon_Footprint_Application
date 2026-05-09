package com.carboncalc.app.controller;

import com.carboncalc.app.dto.badge.BadgeResponse;
import com.carboncalc.app.dto.common.ApiResponse;
import com.carboncalc.app.service.badge.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    @GetMapping("/{userId}")
    public ApiResponse<List<BadgeResponse>> getBadges(@PathVariable Long userId) {
        return ApiResponse.<List<BadgeResponse>>builder()
                .success(true)
                .message("Badges fetched successfully")
                .data(badgeService.getBadges(userId))
                .build();
    }
}