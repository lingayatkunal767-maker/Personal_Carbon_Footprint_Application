package com.ecotrack.backend.controller;

import com.ecotrack.backend.entity.Badge;
import com.ecotrack.backend.entity.Goal;
import com.ecotrack.backend.entity.MarketplaceItem;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.*;
import com.ecotrack.backend.service.GoalService;
import com.ecotrack.backend.service.LogService;
import com.ecotrack.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AdminController {

    private final UserRepository        userRepo;
    private final CarbonEntryRepository carbonRepo;
    private final GoalRepository        goalRepo;
    private final BadgeRepository       badgeRepo;
    private final SurveyRepository      surveyRepo;
    private final MarketplaceRepository marketplaceRepo;
    private final NotificationService   notificationService;
    private final GoalService           goalService;
    @Autowired
    private LogService logService;

    private boolean isAdmin(User u) { return "ADMIN".equals(u.getRole()); }

    // ── Analytics ─────────────────────────────────────────────────────────────
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(@AuthenticationPrincipal User user) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        log.info("Admin analytics requested by userId={}", user.getId());

        long   totalUsers  = userRepo.count();
        long   activeUsers = 0;
        double totalKg     = 0;
        try { activeUsers = carbonRepo.countActiveUsers(); } catch (Exception e) { log.warn("countActiveUsers: {}", e.getMessage()); }
        try { Double r = carbonRepo.sumAll(); if (r != null) totalKg = Math.round(r*10.0)/10.0; } catch (Exception e) { log.warn("sumAll: {}", e.getMessage()); }
        double avg = totalUsers > 0 ? Math.round((totalKg/totalUsers)*10.0)/10.0 : 0;

        long totalGoals = 0, completedGoals = 0;
        try { totalGoals     = goalRepo.count(); } catch (Exception e) { log.warn("goalCount: {}", e.getMessage()); }
        try { completedGoals = goalRepo.findAll().stream().filter(g -> "COMPLETED".equals(g.getStatus())).count(); } catch (Exception e) { log.warn("completedGoals: {}", e.getMessage()); }

        Map<String,Double> breakdown = new LinkedHashMap<>();
        try { for (Object[] r : carbonRepo.sumByCategoryGlobal()) breakdown.put((String)r[0], Math.round((Double)r[1]*10.0)/10.0); } catch (Exception e) { log.warn("breakdown: {}", e.getMessage()); }

        List<Map<String,Object>> topUsers = new ArrayList<>();
        try {
            for (User u : userRepo.findAll()) {
                Double t = null;
                try { t = carbonRepo.sumByUser(u); } catch (Exception ignored) {}
                if (t == null || t == 0) continue;
                Map<String,Object> m = new LinkedHashMap<>();
                m.put("id",u.getId()); m.put("name",u.getName()); m.put("email",u.getEmail());
                m.put("role",u.getRole()); m.put("totalKg", Math.round(t*10.0)/10.0);
                topUsers.add(m);
            }
            topUsers.sort((a,b) -> Double.compare((Double)b.get("totalKg"),(Double)a.get("totalKg")));
        } catch (Exception e) { log.warn("topUsers: {}", e.getMessage()); }

        Map<String,Object> result = new LinkedHashMap<>();
        result.put("totalUsers",       totalUsers);
        result.put("activeUsers",      activeUsers);
        result.put("totalCarbonKg",    totalKg);
        result.put("avgCarbonPerUser", avg);
        result.put("totalGoals",       totalGoals);
        result.put("completedGoals",   completedGoals);
        result.put("categoryBreakdown",breakdown);
        result.put("topUsers",         topUsers.stream().limit(10).toList());
        return ResponseEntity.ok(result);
    }

    // ── Users ─────────────────────────────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal User user) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error","Access denied"));
        List<Map<String,Object>> users = new ArrayList<>();
        for (User u : userRepo.findAll()) {
            Double t = null;
            try { t = carbonRepo.sumByUser(u); } catch (Exception ignored) {}
            Map<String,Object> m = new LinkedHashMap<>();
            m.put("id",u.getId()); m.put("name",u.getName()); m.put("email",u.getEmail());
            m.put("role",u.getRole()); m.put("enabled",u.isEnabled());
            m.put("totalKg", t != null ? Math.round(t*10.0)/10.0 : 0);
            m.put("createdAt",u.getCreatedAt());
            users.add(m);
        }
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(@AuthenticationPrincipal User admin,
                                         @PathVariable Long id,
                                         @RequestBody Map<String,String> req) {
        if (!isAdmin(admin)) return ResponseEntity.status(403).body(Map.of("error","Access denied"));
        User u = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        u.setRole(req.get("role"));
        userRepo.save(u);
        log.info("Role changed: userId={} newRole={} by adminId={}", id, req.get("role"), admin.getId());
        return ResponseEntity.ok(Map.of("message","Role updated"));
    }

    // ── Badges ─────────────────────────────────────────────────────────────────
    @GetMapping("/badges")
    public ResponseEntity<?> getBadges(@AuthenticationPrincipal User user) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error","Access denied"));
        // Badge.createdBy now has @JsonIgnoreProperties so no more StackOverflow
        var all = badgeRepo.findAll();
        log.debug("Admin badge list: count={}", all.size());

        return ResponseEntity.ok(all);
    }

    @PostMapping("/badges")
    public ResponseEntity<?> createBadge(@AuthenticationPrincipal User user, @RequestBody Badge req) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error","Access denied"));
        req.setCreatedBy(user);
        req.setActive(true);
        if (req.getIconName() == null && req.getIcon() != null) req.setIconName(req.getIcon());
        if (req.getIcon()     == null && req.getIconName() != null) req.setIcon(req.getIconName());
        Badge saved = badgeRepo.save(req);
        log.info("Badge created: id={} name='{}' by adminId={}", saved.getId(), saved.getName(), user.getId());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/badges/{id}")
    public ResponseEntity<?> updateBadge(@AuthenticationPrincipal User user,
                                          @PathVariable Long id, @RequestBody Badge req) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error","Access denied"));
        Badge b = badgeRepo.findById(id).orElseThrow(() -> new RuntimeException("Badge not found"));
        b.setName(req.getName()); b.setDescription(req.getDescription());
        b.setIcon(req.getIcon()); b.setIconName(req.getIcon());
        b.setCategory(req.getCategory()); b.setThresholdKg(req.getThresholdKg());
        b.setColor(req.getColor()); b.setBgColor(req.getBgColor()); b.setActive(req.isActive());
        Badge saved = badgeRepo.save(b);
        log.info("Badge updated: id={}", id);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/badges/{id}")
    public ResponseEntity<?> deleteBadge(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error","Access denied"));
        badgeRepo.deleteById(id);
        log.info("Badge deleted: id={} by adminId={}", id, user.getId());
        return ResponseEntity.noContent().build();
    }

    // ── Community Goals ───────────────────────────────────────────────────────
    /**
     * FIX: Community goals are now SAVED TO THE DATABASE (not just returned as a fake map).
     * This makes them visible on the GoalPage for all users immediately.
     * Also returns the list of all community goals with accepted/rejected stats.
     */
    @PostMapping("/goals")
    public ResponseEntity<?> createGlobalGoal(@AuthenticationPrincipal User user,
                                               @RequestBody Map<String,Object> req) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error","Access denied"));
        try {
            String title       = (String) req.get("title");
            String description = (String) req.getOrDefault("description","");
            String category    = (String) req.getOrDefault("category","general");
            String deadlineStr = (String) req.get("deadline");
            double targetAmt   = req.get("targetAmount") instanceof Number n
                                 ? n.doubleValue() : Double.parseDouble(req.get("targetAmount").toString());

            Goal goal = Goal.builder()
                    .user(user)
                    .title(title)
                    .description(description)
                    .category(category)
                    .targetAmount(targetAmt)
                    .deadline(deadlineStr != null ? LocalDate.parse(deadlineStr) : null)
                    .currentProgress(0.0)
                    .status("ACTIVE")
                    .isCommunityGoal(true)
                    .acceptedCount(0)
                    .rejectedCount(0)
                    .build();

            Goal saved = goalRepo.save(goal);
            log.info("Community goal saved: id={} title='{}' by adminId={}", saved.getId(), title, user.getId());
            return ResponseEntity.ok(goalService.toDto(saved));
        } catch (Exception e) {
            log.error("Failed to create community goal: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** GET /api/admin/goals — all community goals with stats */
    @GetMapping("/goals")
    public ResponseEntity<?> getCommunityGoals(@AuthenticationPrincipal User user) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error","Access denied"));
        var goals = goalRepo.findByIsCommunityGoalTrueOrderByCreatedAtDesc()
                .stream().map(goalService::toDto).toList();
        return ResponseEntity.ok(goals);
    }

    // ── Marketplace admin CRUD ────────────────────────────────────────────────
    @PostMapping("/marketplace")
    public ResponseEntity<?> createItem(@AuthenticationPrincipal User user, @RequestBody MarketplaceItem req) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error","Access denied"));
        MarketplaceItem saved = marketplaceRepo.save(req);
        log.info("Marketplace item created: id={} name='{}'", saved.getId(), saved.getName());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/marketplace/{id}")
    public ResponseEntity<?> updateItem(@AuthenticationPrincipal User user,
                                         @PathVariable Long id, @RequestBody MarketplaceItem req) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error","Access denied"));
        MarketplaceItem item = marketplaceRepo.findById(id).orElseThrow(() -> new RuntimeException("Item not found"));
        item.setName(req.getName()); item.setDescription(req.getDescription());
        item.setCost(req.getCost()); item.setOffsetValue(req.getOffsetValue());
        item.setCategory(req.getCategory());
        log.info("Marketplace item updated: id={}", id);
        return ResponseEntity.ok(marketplaceRepo.save(item));
    }

    @DeleteMapping("/marketplace/{id}")
    public ResponseEntity<?> deleteItem(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (!isAdmin(user)) return ResponseEntity.status(403).body(Map.of("error","Access denied"));
        marketplaceRepo.deleteById(id);
        log.info("Marketplace item deleted: id={} by adminId={}", id, user.getId());
        return ResponseEntity.noContent().build();
    }

    // ── Broadcast notification ────────────────────────────────────────────────
    @PostMapping("/notifications/broadcast")
    public ResponseEntity<?> broadcast(@AuthenticationPrincipal User admin,
                                        @RequestBody Map<String,String> req) {
        if (!isAdmin(admin)) return ResponseEntity.status(403).body(Map.of("error","Access denied"));
        String title = req.getOrDefault("title","").trim();
        String body  = req.getOrDefault("body","").trim();
        String type  = req.getOrDefault("type","general");
        if (title.isEmpty() || body.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error","Title and body are required"));
        log.info("Admin broadcast: adminId={} type='{}' title='{}'", admin.getId(), type, title);
        int count = notificationService.broadcastToAll(title, body, type);
        logService.log("sakthi13balan@gmail.com","ADMIN", "SEND_NOTIFICATION", "Sent to " + count + " users");
        return ResponseEntity.ok(Map.of("message","Sent to " + count + " users", "count", count));
    }
    @Autowired
    private SystemLogRepository logRepository;

    @GetMapping("/logs")
    public ResponseEntity<?> getAllLogs() {
        return ResponseEntity.ok(logRepository.findAll());
    }
}
