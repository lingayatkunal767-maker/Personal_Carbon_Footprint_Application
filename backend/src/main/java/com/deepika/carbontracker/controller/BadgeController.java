package com.deepika.carbontracker.controller;

import com.deepika.carbontracker.dto.BadgeRequest;
import com.deepika.carbontracker.dto.BadgeResponse;
import com.deepika.carbontracker.model.User;
import com.deepika.carbontracker.repository.UserRepository;
import com.deepika.carbontracker.service.BadgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
public class BadgeController {

    @Autowired
    private BadgeService badgeService;

    @Autowired
    private UserRepository userRepository;

    // ------------------------------------------------------------------
    // Helper — resolve the currently authenticated user's ID from JWT
    // ------------------------------------------------------------------
    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        return user.getId();
    }

    // GET /api/badges — list all badges earned by the logged-in user
    @GetMapping
    public ResponseEntity<List<BadgeResponse>> getMyBadges() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(badgeService.getBadgesByUser(userId));
    }

    // POST /api/badges — award a badge to the logged-in user
    // (In production this would be ADMIN-only or triggered automatically
    // by business logic; kept open here for integration testing.)
    @PostMapping
    public ResponseEntity<?> awardBadge(@RequestBody BadgeRequest request) {
        Long userId = getCurrentUserId();
        try {
            BadgeResponse response = badgeService.awardBadge(userId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // POST /api/badges/award/{userId} — admin awards a badge to any user
    @PostMapping("/award/{userId}")
    public ResponseEntity<?> awardBadgeToUser(@PathVariable Long userId,
            @RequestBody BadgeRequest request) {
        try {
            BadgeResponse response = badgeService.awardBadge(userId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
