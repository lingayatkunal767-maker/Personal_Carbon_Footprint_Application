package com.ecotrack.backend.controller;

import com.ecotrack.backend.dto.GoalRequest;
import com.ecotrack.backend.dto.ProgressRequest;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.service.GoalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class GoalController {

    private final GoalService service;

    /** GET /api/goals — all personal + community goals */
    @GetMapping
    public ResponseEntity<?> getAll(@AuthenticationPrincipal User user) {
        log.debug("GET /api/goals userId={}", user.getId());
        return ResponseEntity.ok(service.getAll(user));
    }

    /** POST /api/goals — create a personal goal */
    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal User user,
                                     @RequestBody GoalRequest req) {
        log.info("POST /api/goals userId={} title='{}'", user.getId(), req.getTitle());
        return ResponseEntity.ok(service.create(user, req));
    }

    /** PATCH /api/goals/{id}/progress — set exact progress on a specific goal */
    @PatchMapping("/{id}/progress")
    public ResponseEntity<?> updateProgress(@AuthenticationPrincipal User user,
                                             @PathVariable Long id,
                                             @RequestBody ProgressRequest req) {
        log.info("PATCH /api/goals/{}/progress userId={} value={}", id, user.getId(), req.getProgress());
        return ResponseEntity.ok(service.updateProgress(user, id, req.getProgress()));
    }

    /**
     * PATCH /api/goals/active/increment
     * FIX: This endpoint was missing. LogActivityModal + GoalPage both call it.
     * Adds the given progress to the most recent ACTIVE personal goal.
     */
    @PatchMapping("/active/increment")
    public ResponseEntity<?> incrementActive(@AuthenticationPrincipal User user,
                                              @RequestBody ProgressRequest req) {
        log.info("PATCH /api/goals/active/increment userId={} add={}", user.getId(), req.getProgress());
        try {
            return ResponseEntity.ok(service.addProgress(user, req.getProgress()));
        } catch (RuntimeException e) {
            log.warn("No active goal for userId={}: {}", user.getId(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/goals/{id}/accept
     * User accepts a community challenge — creates a personal copy.
     */
    @PostMapping("/{id}/accept")
    public ResponseEntity<?> accept(@AuthenticationPrincipal User user,
                                     @PathVariable Long id) {
        log.info("POST /api/goals/{}/accept userId={}", id, user.getId());
        try {
            return ResponseEntity.ok(service.acceptCommunityGoal(user, id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/goals/{id}/reject
     * User rejects a community challenge — increments reject count only.
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@AuthenticationPrincipal User user,
                                     @PathVariable Long id) {
        log.info("POST /api/goals/{}/reject userId={}", id, user.getId());
        try {
            service.rejectCommunityGoal(user, id);
            return ResponseEntity.ok(Map.of("message", "Challenge declined"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** DELETE /api/goals/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal User user,
                                     @PathVariable Long id) {
        log.info("DELETE /api/goals/{} userId={}", id, user.getId());
        service.delete(user, id);
        return ResponseEntity.noContent().build();
    }
}
