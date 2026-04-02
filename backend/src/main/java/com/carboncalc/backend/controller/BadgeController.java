package com.carboncalc.backend.controller;

import com.carboncalc.backend.dto.BadgeDefinitionResponse;
import com.carboncalc.backend.dto.BadgeResponse;
import com.carboncalc.backend.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@CrossOrigin
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    @GetMapping
    public ResponseEntity<List<BadgeResponse>> getBadges() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        // We need userId — delegate via service using email lookup
        return ResponseEntity.ok(badgeService.getUserBadgesByEmail(email));
    }

    @GetMapping("/definitions")
    public ResponseEntity<List<BadgeDefinitionResponse>> getDefinitions() {
        return ResponseEntity.ok(badgeService.getAllDefinitions());
    }

    @PostMapping("/{id}/claim")
    public ResponseEntity<BadgeResponse> claimBadge(@PathVariable("id") Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(badgeService.claimBadgeByEmail(id, email));
    }
}
