package com.ecotrack.backend.controller;

import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.BadgeRepository;
import com.ecotrack.backend.repository.CarbonEntryRepository;
import com.ecotrack.backend.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class BadgeController {

    private final BadgeRepository       badgeRepo;
    private final CarbonEntryRepository carbonRepo;
    private final SurveyRepository      surveyRepo;

    /**
     * GET /api/badges/current
     *
     * FIX: Wrapped every DB call in try-catch so a missing survey / empty
     * carbon table never crashes the whole endpoint with a 500.
     * Returns all built-in badges + admin-created ones with earned status.
     */
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentUserBadges(@AuthenticationPrincipal User user) {

        // ── Carbon totals (safe defaults if table is empty) ──────────────────
        double totalKg     = 0;
        double transportKg = 0;
        double energyKg    = 0;
        double foodKg      = 0;

        try {
            Double raw = carbonRepo.sumByUser(user);
            if (raw != null) totalKg = raw;
        } catch (Exception ignored) {}

        try {
            for (Object[] row : carbonRepo.sumByCategoryForUser(user)) {
                if (row[0] == null || row[1] == null) continue;
                String cat = row[0].toString().toLowerCase();
                double val = ((Number) row[1]).doubleValue();
                switch (cat) {
                    case "transport" -> transportKg = val;
                    case "energy"    -> energyKg    = val;
                    case "food"      -> foodKg       = val;
                }
            }
        } catch (Exception ignored) {}

        // ── Survey flags (safe defaults if no survey yet) ────────────────────
        boolean hasSurvey = false;
        boolean isBike    = false;
        boolean isRenew   = false;
        boolean isVeg     = false;

        try {
            var surveyOpt = surveyRepo.findByUser(user);
            if (surveyOpt.isPresent()) {
                var s = surveyOpt.get();
                hasSurvey = s.getPrimaryTransport() != null;
                isBike    = hasSurvey && ("bicycle".equals(s.getPrimaryTransport())
                                       || "walking".equals(s.getPrimaryTransport()));
                isRenew   = Boolean.TRUE.equals(s.getHasRenewableEnergy());
                isVeg     = "vegan".equals(s.getDietType())
                         || "vegetarian".equals(s.getDietType());
            }
        } catch (Exception ignored) {}

        // ── Build badge list ─────────────────────────────────────────────────
        List<Map<String, Object>> badges = new ArrayList<>();

        // Built-in badges (hardcoded)
        badges.add(b("Eco Starter",     "Complete your first lifestyle survey",     "Sparkles",    "bg-emerald-100", "text-emerald-600", 0,   hasSurvey,         totalKg));
        badges.add(b("Transport Pro",   "Log 30 kg of transport emissions",          "Car",         "bg-blue-100",    "text-blue-600",    30,  transportKg >= 30, transportKg));
        badges.add(b("Energy Saver",    "Log 10 kg of energy emissions",            "Zap",         "bg-yellow-100",  "text-yellow-600",  10,  energyKg >= 10,    energyKg));
        badges.add(b("Tree Planter",    "Save 50 kg CO₂e total",                    "Leaf",        "bg-green-100",   "text-green-600",   50,  totalKg >= 50,     totalKg));
        badges.add(b("Nature Guardian", "Save 100 kg CO₂e total",                  "TreePine",    "bg-teal-100",    "text-teal-600",    100, totalKg >= 100,    totalKg));
        badges.add(b("Eco Master",      "Save 200 kg CO₂e total",                  "ShieldCheck", "bg-purple-100",  "text-purple-600",  200, totalKg >= 200,    totalKg));
        badges.add(b("Green Commuter",  "Use bicycle or walking as main transport", "Car",         "bg-cyan-100",    "text-cyan-600",    0,   isBike,            isBike ? 1 : 0));
        badges.add(b("Renewable Hero",  "Enable renewable energy in survey",         "Zap",         "bg-orange-100",  "text-orange-600",  0,   isRenew,           isRenew ? 1 : 0));
        badges.add(b("Plant Based Pro", "Choose vegan/vegetarian diet in survey",   "Leaf",        "bg-lime-100",    "text-lime-600",    0,   isVeg,             isVeg ? 1 : 0));
        badges.add(b("Goal Crusher",    "Log 10 kg of food emissions",              "Award",       "bg-rose-100",    "text-rose-600",    10,  foodKg >= 10,      foodKg));

        // Admin-created badges (from DB) — safe iteration
        try {
            for (var ab : badgeRepo.findByActiveTrue()) {
                double threshold = ab.getThresholdKg() != null ? ab.getThresholdKg() : 0;
                badges.add(b(
                    ab.getName()        != null ? ab.getName()        : "Custom Badge",
                    ab.getDescription() != null ? ab.getDescription() : "",
                    ab.getIcon()        != null ? ab.getIcon()        : "Award",
                    ab.getBgColor()     != null ? ab.getBgColor()     : "bg-green-100",
                    ab.getColor()       != null ? ab.getColor()       : "text-green-600",
                    threshold,
                    totalKg >= threshold,
                    totalKg
                ));
            }
        } catch (Exception ignored) {}

        return ResponseEntity.ok(badges);
    }

    // Helper to build a badge map
    private Map<String, Object> b(String name, String desc, String iconName,
                                    String bgColor, String color,
                                    double target, boolean earned, double current) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name",        name);
        m.put("description", desc);
        m.put("iconName",    iconName);
        m.put("bgColor",     bgColor);
        m.put("color",       color);
        m.put("target",      target);
        m.put("current",     Math.round(current * 10.0) / 10.0);
        m.put("earned",      earned);
        m.put("progress",    target > 0
                ? (int) Math.min((current / target) * 100, 100)
                : (earned ? 100 : 0));
        return m;
    }
}
