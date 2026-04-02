package com.carboncalc.backend.config;

import com.carboncalc.backend.entity.BadgeDefinition;
import com.carboncalc.backend.entity.MarketplaceItem;
import com.carboncalc.backend.entity.User;
import com.carboncalc.backend.repository.BadgeDefinitionRepository;
import com.carboncalc.backend.repository.MarketplaceRepository;
import com.carboncalc.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final MarketplaceRepository marketplaceRepository;
    private final BadgeDefinitionRepository badgeDefinitionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        // Seed admin account
        if (userRepository.findByEmail("admin@carboncalc.com").isEmpty()) {
            userRepository.save(User.builder()
                .name("Admin")
                .email("admin@carboncalc.com")
                .password(passwordEncoder.encode("Admin@123"))
                .role("ADMIN")
                .isActive(true)
                .build());
        }

        // Seed marketplace items
        if (marketplaceRepository.count() == 0) {
            marketplaceRepository.saveAll(List.of(
                item("Tree Plantation",      "Tree Plantation",            200.0,
                     "Plant a tree in a deforested region to absorb CO₂ and restore biodiversity.", 10.0),
                item("Solar Energy Support", "Renewable Energy",           500.0,
                     "Fund solar panel installation in rural communities to replace fossil fuel usage.", 25.0),
                item("Carbon Credit",        "Environmental Contribution", 350.0,
                     "Purchase a verified carbon credit that offsets industrial emissions on your behalf.", 18.0),
                item("Wind Energy Fund",     "Renewable Energy",           450.0,
                     "Contribute to wind farm development that generates clean electricity for thousands.", 22.0),
                item("Ocean Cleanup Pledge", "Environmental Contribution", 300.0,
                     "Support ocean plastic removal initiatives that protect marine ecosystems.", 15.0),
                item("Mangrove Restoration", "Tree Plantation",            250.0,
                     "Restore coastal mangrove forests that sequester carbon and protect shorelines.", 12.0)
            ));
        }

        // Seed / update badge definitions (upsert by name so new fields + new badges are always applied)
        upsertBadge("Eco Starter",          "🌱", "bg-blue-50",    "Submitted your first survey",          "Submit 1 survey",      "COMMON", 50);
        upsertBadge("Survey Enthusiast",    "📝", "bg-indigo-50",  "Submitted 5 surveys",                  "Submit 5 surveys",     "COMMON", 75);
        upsertBadge("Consistent Tracker",   "📊", "bg-purple-50",  "Submitted 7 surveys in a row",         "Submit 7 surveys",     "RARE",   100);
        upsertBadge("Eco Warrior",          "⚔️", "bg-cyan-50",    "Submitted 15 surveys",                 "Submit 15 surveys",    "RARE",   150);
        upsertBadge("Carbon Cutter",        "🌿", "bg-green-50",   "Submitted 30 surveys",                 "Submit 30 surveys",    "EPIC",   250);
        upsertBadge("Planet Guardian",      "🛡️", "bg-emerald-50", "Submitted 50 surveys",                 "Submit 50 surveys",    "EPIC",   500);
        upsertBadge("Goal Setter",          "🎯", "bg-orange-50",  "Created your first goal",              "Create 1 goal",        "COMMON", 50);
        upsertBadge("Green Achiever",       "🏆", "bg-yellow-50",  "Completed your first goal",            "Complete 1 goal",      "COMMON", 100);
        upsertBadge("Sustainability Champ", "🌍", "bg-teal-50",    "Completed 3 or more goals",            "Complete 3 goals",     "RARE",   200);
        upsertBadge("Triple Achiever",      "🥇", "bg-rose-50",    "Completed 5 or more goals",            "Complete 5 goals",     "EPIC",   350);
        upsertBadge("Goal Master",          "👑", "bg-amber-50",   "Completed 10 or more goals",           "Complete 10 goals",    "EPIC",   600);
        upsertBadge("Low Carbon Hero",      "💚", "bg-lime-50",    "Scored under 2 kg CO₂ in a survey",    "Score under 2 kg CO₂", "RARE",   120);
        upsertBadge("Zero Emission Day",    "⚡", "bg-sky-50",     "Scored 0 kg transport emission",       "Zero transport score", "RARE",   80);
        upsertBadge("Plant Power",          "🥦", "bg-green-50",   "Submitted a survey with vegan diet",   "Submit vegan survey",  "COMMON", 60);
        upsertBadge("Solar Champion",       "☀️", "bg-yellow-50",  "Used renewable energy in a survey",    "Use renewable energy", "COMMON", 60);
    }

    private MarketplaceItem item(String name, String type, double price, String desc, double offset) {
        return MarketplaceItem.builder()
            .itemName(name).itemType(type).price(price)
            .description(desc).carbonOffsetValue(offset)
            .createdAt(LocalDateTime.now()).build();
    }

    private void upsertBadge(String name, String icon, String bg, String desc, String req, String rarity, int points) {
        try {
            BadgeDefinition existing = badgeDefinitionRepository.findByBadgeName(name).orElse(null);
            if (existing == null) {
                badgeDefinitionRepository.saveAndFlush(BadgeDefinition.builder()
                    .badgeName(name).icon(icon).bgColor(bg)
                    .description(desc).requirement(req)
                    .rarity(rarity).rewardPoints(points)
                    .createdAt(LocalDateTime.now()).build());
            } else {
                existing.setIcon(icon);
                existing.setBgColor(bg);
                existing.setDescription(desc);
                existing.setRequirement(req);
                existing.setRarity(rarity);
                existing.setRewardPoints(points);
                badgeDefinitionRepository.saveAndFlush(existing);
            }
            System.out.println("[DataInitializer] Badge upserted: " + name);
        } catch (Exception e) {
            System.err.println("[DataInitializer] Failed to upsert badge '" + name + "': " + e.getMessage());
        }
    }
}
