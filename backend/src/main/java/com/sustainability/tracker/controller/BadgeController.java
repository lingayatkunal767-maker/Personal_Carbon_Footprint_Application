package com.sustainability.tracker.controller;

import com.sustainability.tracker.dto.BadgeResponseDTO;
import com.sustainability.tracker.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    // GET /api/badges/user/{userId}
    @GetMapping("/user/{userId}")
    public List<BadgeResponseDTO> getByUser(@PathVariable Long userId) {
        return badgeService.getBadgesByUser(userId);
    }
}
