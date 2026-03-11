package com.carbon.carbon.controller;

import com.carbon.carbon.dto.BadgeDTO;
import com.carbon.carbon.service.BadgeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/badges")
@CrossOrigin
public class BadgeController {

    private final BadgeService badgeService;

    public BadgeController(BadgeService badgeService) {
        this.badgeService = badgeService;
    }

    /**
     * Get all badges for a user
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getUserBadges(@PathVariable Long userId) {
        try {
            List<BadgeDTO> badges = badgeService.getUserBadges(userId);
            return ResponseEntity.ok(badges);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid user ID: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching user badges", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch badges"));
        }
    }

    /**
     * Get badge by ID
     */
    @GetMapping("/{badgeId}")
    public ResponseEntity<?> getBadgeById(@PathVariable Long badgeId) {
        try {
            BadgeDTO badge = badgeService.getBadgeById(badgeId);
            return ResponseEntity.ok(badge);
        } catch (RuntimeException e) {
            log.warn("Badge not found: {}", badgeId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Badge not found"));
        } catch (Exception e) {
            log.error("Error fetching badge", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch badge"));
        }
    }

    /**
     * Award badge to user (Admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> awardBadge(@RequestBody Map<String, String> request) {
        try {
            Long userId = Long.valueOf(request.get("userId"));
            String badgeName = request.get("badgeName");
            String description = request.get("description");

            BadgeDTO badge = badgeService.awardBadge(userId, badgeName, description);
            return ResponseEntity.status(HttpStatus.CREATED).body(badge);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid input for badge award: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            log.warn("Error awarding badge: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error awarding badge", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to award badge"));
        }
    }

    /**
     * Check if user has a specific badge
     */
    @GetMapping("/user/{userId}/has/{badgeName}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> hasBadge(
            @PathVariable Long userId,
            @PathVariable String badgeName) {
        try {
            boolean hasBadge = badgeService.hasBadge(userId, badgeName);
            return ResponseEntity.ok(Map.of("userId", userId, "badgeName", badgeName, "hasBadge", hasBadge));
        } catch (Exception e) {
            log.error("Error checking badge", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to check badge"));
        }
    }

    /**
     * Get badge count for a user
     */
    @GetMapping("/user/{userId}/count")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getUserBadgeCount(@PathVariable Long userId) {
        try {
            long count = badgeService.getUserBadgeCount(userId);
            return ResponseEntity.ok(Map.of("userId", userId, "badgeCount", count));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid user ID: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error counting badges", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to count badges"));
        }
    }

    /**
     * Remove badge from user
     */
    @DeleteMapping("/{badgeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeBadge(@PathVariable Long badgeId) {
        try {
            badgeService.removeBadge(badgeId);
            return ResponseEntity.ok(Map.of("message", "Badge removed successfully"));
        } catch (RuntimeException e) {
            log.warn("Badge not found: {}", badgeId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Badge not found"));
        } catch (Exception e) {
            log.error("Error removing badge", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to remove badge"));
        }
    }
}
