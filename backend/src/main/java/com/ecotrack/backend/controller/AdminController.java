package com.ecotrack.backend.controller;

import com.ecotrack.backend.entity.Badge;
import com.ecotrack.backend.entity.Goal;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final UserRepository userRepo;
    private final CarbonEntryRepository carbonRepo;
    private final GoalRepository goalRepo;
    private final BadgeRepository badgeRepo;
    private final SurveyRepository surveyRepo;

    // ── Guard: only ADMIN role ──
    private boolean isAdmin(User user) {
        return "ADMIN".equals(user.getRole());
    }

    // ── GET /api/admin/analytics ── Aggregate analytics
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(@AuthenticationPrincipal User user) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error", "Access denied"));

        long totalUsers    = userRepo.count();
        long activeUsers   = carbonRepo.countActiveUsers();
        Double totalCo2    = carbonRepo.sumAll();
        double totalKg     = totalCo2 != null ? Math.round(totalCo2 * 10.0) / 10.0 : 0;
        double avgPerUser  = totalUsers > 0 ? Math.round((totalKg / totalUsers) * 10.0) / 10.0 : 0;
        long totalGoals    = goalRepo.count();
        long completedGoals = goalRepo.findAll().stream()
            .filter(g -> "COMPLETED".equals(g.getStatus())).count();

        // Category breakdown global
        Map<String, Double> categoryBreakdown = new LinkedHashMap<>();
        for (Object[] row : carbonRepo.sumByCategoryGlobal())
            categoryBreakdown.put((String) row[0], Math.round((Double) row[1] * 10.0) / 10.0);

        // Top 5 users by emissions
        List<Map<String, Object>> topUsers = new ArrayList<>();
        for (User u : userRepo.findAll()) {
            Double t = carbonRepo.sumByUser(u);
            if (t == null || t == 0) continue;
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("id", u.getId());
            entry.put("name", u.getName());
            entry.put("email", u.getEmail());
            entry.put("totalKg", Math.round(t * 10.0) / 10.0);
            entry.put("role", u.getRole());
            topUsers.add(entry);
        }
        topUsers.sort((a, b) -> Double.compare((Double) b.get("totalKg"), (Double) a.get("totalKg")));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalUsers", totalUsers);
        result.put("activeUsers", activeUsers);
        result.put("totalCarbonKg", totalKg);
        result.put("avgCarbonPerUser", avgPerUser);
        result.put("totalGoals", totalGoals);
        result.put("completedGoals", completedGoals);
        result.put("categoryBreakdown", categoryBreakdown);
        result.put("topUsers", topUsers.stream().limit(10).toList());
        return ResponseEntity.ok(result);
    }

    // ── GET /api/admin/users ── All users list
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal User user) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        List<Map<String, Object>> users = new ArrayList<>();
        for (User u : userRepo.findAll()) {
            Double t = carbonRepo.sumByUser(u);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId()); m.put("name", u.getName());
            m.put("email", u.getEmail()); m.put("role", u.getRole());
            m.put("enabled", u.isEnabled());
            m.put("totalKg", t != null ? Math.round(t * 10.0) / 10.0 : 0);
            m.put("createdAt", u.getCreatedAt());
            users.add(m);
        }
        return ResponseEntity.ok(users);
    }

    // ── GET /api/admin/badges ── All badges
    @GetMapping("/badges")
    public ResponseEntity<?> getBadges(@AuthenticationPrincipal User user) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        return ResponseEntity.ok(badgeRepo.findAll());
    }

    // ── POST /api/admin/badges ── Create new badge
    @PostMapping("/badges")
    public ResponseEntity<?> createBadge(@AuthenticationPrincipal User user, @RequestBody Badge req) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        req.setCreatedBy(user);
        req.setActive(true);
        return ResponseEntity.ok(badgeRepo.save(req));
    }

    // ── PUT /api/admin/badges/{id} ── Update badge
    @PutMapping("/badges/{id}")
    public ResponseEntity<?> updateBadge(@AuthenticationPrincipal User user,
                                          @PathVariable Long id, @RequestBody Badge req) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        Badge existing = badgeRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Badge not found"));
        existing.setName(req.getName());
        existing.setDescription(req.getDescription());
        existing.setIcon(req.getIcon());
        existing.setCategory(req.getCategory());
        existing.setThresholdKg(req.getThresholdKg());
        existing.setColor(req.getColor());
        existing.setBgColor(req.getBgColor());
        existing.setActive(req.isActive());
        return ResponseEntity.ok(badgeRepo.save(existing));
    }

    // ── DELETE /api/admin/badges/{id} ── Delete badge
    @DeleteMapping("/badges/{id}")
    public ResponseEntity<?> deleteBadge(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        badgeRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── POST /api/admin/goals ── Create global goal for all users
    @PostMapping("/goals")
    public ResponseEntity<?> createGlobalGoal(@AuthenticationPrincipal User user,
                                               @RequestBody Map<String, Object> req) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        // Return the goal config — frontend shows it as a community challenge
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", System.currentTimeMillis());
        result.put("title", req.get("title"));
        result.put("description", req.get("description"));
        result.put("category", req.get("category"));
        result.put("targetAmount", req.get("targetAmount"));
        result.put("deadline", req.get("deadline"));
        result.put("isGlobal", true);
        result.put("createdBy", user.getName());
        return ResponseEntity.ok(result);
    }

    // ── PUT /api/admin/users/{id}/role ── Change user role
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(@AuthenticationPrincipal User admin,
                                         @PathVariable Long id,
                                         @RequestBody Map<String, String> req) {
        if (!isAdmin(admin)) return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        User u = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        u.setRole(req.get("role"));
        userRepo.save(u);
        return ResponseEntity.ok(Map.of("message", "Role updated"));
    }
}
