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
@CrossOrigin(origins = "http://localhost:5173")
public class BadgeController {

    private final BadgeRepository badgeRepo;
    private final CarbonEntryRepository carbonRepo;
    private final SurveyRepository surveyRepo;

    /**
     * GET /api/badges/current
     * Returns all badges (admin-created + built-in) with earned status for current user.
     */
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentUserBadges(@AuthenticationPrincipal User user) {
        // Get real data for the user
        Double totalKgRaw  = carbonRepo.sumByUser(user);
        double totalKg     = totalKgRaw != null ? totalKgRaw : 0;
        double transportKg = 0, energyKg = 0, foodKg = 0;
        for (Object[] row : carbonRepo.sumByCategoryForUser(user)) {
            String cat = ((String) row[0]).toLowerCase();
            double val = (Double) row[1];
            if (cat.equals("transport")) transportKg = val;
            else if (cat.equals("energy")) energyKg = val;
            else if (cat.equals("food")) foodKg = val;
        }
        var survey     = surveyRepo.findByUser(user).orElse(null);
        boolean hasSurvey = survey != null && survey.getPrimaryTransport() != null;
        boolean isBike    = hasSurvey && ("bicycle".equals(survey.getPrimaryTransport()) || "walking".equals(survey.getPrimaryTransport()));
        boolean isRenew   = hasSurvey && Boolean.TRUE.equals(survey.getHasRenewableEnergy());
        boolean isVeg     = hasSurvey && ("vegan".equals(survey.getDietType()) || "vegetarian".equals(survey.getDietType()));

        // Built-in badges
        List<Map<String, Object>> badges = new ArrayList<>();
        badges.add(badge("Eco Starter",    "Completed your first lifestyle survey",    "Sparkles", "bg-emerald-100", "text-emerald-600", 0, hasSurvey, totalKg));
        badges.add(badge("Transport Pro",  "Log 30 kg of transport emissions",          "Car",      "bg-blue-100",    "text-blue-600",    30, transportKg >= 30, transportKg));
        badges.add(badge("Energy Saver",   "Log 10 kg of energy emissions",             "Zap",      "bg-yellow-100",  "text-yellow-600",  10, energyKg >= 10, energyKg));
        badges.add(badge("Tree Planter",   "Save 50 kg CO₂e total",                     "Leaf",     "bg-green-100",   "text-green-600",   50, totalKg >= 50, totalKg));
        badges.add(badge("Nature Guardian","Save 100 kg CO₂e total",                    "TreePine", "bg-teal-100",    "text-teal-600",    100, totalKg >= 100, totalKg));
        badges.add(badge("Eco Master",     "Save 200 kg CO₂e total",                    "ShieldCheck","bg-purple-100","text-purple-600",  200, totalKg >= 200, totalKg));
        badges.add(badge("Green Commuter", "Use bicycle or walking as main transport",  "Car",      "bg-cyan-100",    "text-cyan-600",    0, isBike, isBike ? 1 : 0));
        badges.add(badge("Renewable Hero", "Enable renewable energy in survey",          "Zap",      "bg-orange-100",  "text-orange-600",  0, isRenew, isRenew ? 1 : 0));
        badges.add(badge("Plant Based Pro","Choose vegan/vegetarian diet in survey",    "Leaf",     "bg-lime-100",    "text-lime-600",    0, isVeg, isVeg ? 1 : 0));
        badges.add(badge("Goal Crusher",   "Log 10 kg food emissions",                  "Award",    "bg-rose-100",    "text-rose-600",    10, foodKg >= 10, foodKg));

        // Merge admin-created badges
        for (var adminBadge : badgeRepo.findByActiveTrue()) {
            double threshold = adminBadge.getThresholdKg() != null ? adminBadge.getThresholdKg() : 0;
            boolean earned   = totalKg >= threshold;
            badges.add(badge(
                adminBadge.getName(), adminBadge.getDescription(),
                adminBadge.getIcon() != null ? adminBadge.getIcon() : "Award",
                adminBadge.getBgColor() != null ? adminBadge.getBgColor() : "bg-green-100",
                adminBadge.getColor()   != null ? adminBadge.getColor()   : "text-green-600",
                threshold, earned, totalKg
            ));
        }

        return ResponseEntity.ok(badges);
    }

    private Map<String, Object> badge(String name, String desc, String iconName,
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
        m.put("progress",    target > 0 ? (int) Math.min((current / target) * 100, 100) : (earned ? 100 : 0));
        return m;
    }
}
