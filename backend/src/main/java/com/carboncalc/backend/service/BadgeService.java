package com.carboncalc.backend.service;

import com.carboncalc.backend.dto.BadgeDefinitionRequest;
import com.carboncalc.backend.dto.BadgeDefinitionResponse;
import com.carboncalc.backend.dto.BadgeResponse;
import com.carboncalc.backend.entity.Badge;
import com.carboncalc.backend.entity.BadgeDefinition;
import com.carboncalc.backend.entity.User;
import com.carboncalc.backend.repository.BadgeDefinitionRepository;
import com.carboncalc.backend.repository.BadgeRepository;
import com.carboncalc.backend.repository.GoalRepository;
import com.carboncalc.backend.repository.SurveyRepository;
import com.carboncalc.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final BadgeDefinitionRepository badgeDefinitionRepository;
    private final UserRepository userRepository;
    private final SurveyRepository surveyRepository;
    private final GoalRepository goalRepository;
    private final NotificationService notificationService;

    public List<BadgeResponse> getUserBadgesByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return badgeRepository.findByUserIdOrderByAwardedAtDesc(user.getId())
            .stream().map(this::toDto).toList();
    }

    public List<BadgeResponse> getUserBadges(Long userId) {
        return badgeRepository.findByUserIdOrderByAwardedAtDesc(userId)
            .stream().map(this::toDto).toList();
    }

    public List<BadgeDefinitionResponse> getAllDefinitions() {
        return badgeDefinitionRepository.findAll()
            .stream().map(this::toDefDto).toList();
    }

    @Transactional
    public BadgeDefinitionResponse createDefinition(BadgeDefinitionRequest req) {
        if (badgeDefinitionRepository.existsByBadgeName(req.getBadgeName())) {
            throw new RuntimeException("Badge with this name already exists.");
        }
        BadgeDefinition def = BadgeDefinition.builder()
            .badgeName(req.getBadgeName())
            .description(req.getDescription())
            .icon(req.getIcon() != null ? req.getIcon() : "🎖️")
            .requirement(req.getRequirement())
            .bgColor(req.getBgColor() != null ? req.getBgColor() : "bg-gray-50")
            .createdAt(LocalDateTime.now())
            .build();
        return toDefDto(badgeDefinitionRepository.save(def));
    }

    @Transactional
    public void deleteDefinition(Long id) {
        badgeDefinitionRepository.deleteById(id);
    }

    @Transactional
    public void evaluateBadges(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        long surveyCount   = surveyRepository.countByUserId(userId);
        long goalsAchieved = goalRepository.countByUserIdAndStatus(userId, "ACHIEVED");
        long totalGoals    = goalRepository.countByUserId(userId);

        // Get latest survey for content-based badges
        var latestSurvey = surveyRepository.findFirstByUserIdOrderByDateDesc(userId);
        boolean latestIsVegan      = latestSurvey.map(s -> "vegan".equalsIgnoreCase(s.getFood())).orElse(false);
        boolean latestIsRenewable  = latestSurvey.map(s -> Boolean.TRUE.equals(s.getRenewableEnergy())).orElse(false);
        boolean latestZeroTransport = latestSurvey.map(s -> s.getTransportEmission() != null && s.getTransportEmission() == 0.0).orElse(false);
        boolean latestLowCarbon    = latestSurvey.map(s -> s.getCarbonScore() != null && s.getCarbonScore() < 2.0).orElse(false);

        // Survey count badges
        awardIfNew(user, "Eco Starter",          surveyCount >= 1);
        awardIfNew(user, "Survey Enthusiast",    surveyCount >= 5);
        awardIfNew(user, "Consistent Tracker",   surveyCount >= 7);
        awardIfNew(user, "Eco Warrior",          surveyCount >= 15);
        awardIfNew(user, "Carbon Cutter",        surveyCount >= 30);
        awardIfNew(user, "Planet Guardian",      surveyCount >= 50);

        // Goal badges
        awardIfNew(user, "Goal Setter",          totalGoals >= 1);
        awardIfNew(user, "Green Achiever",       goalsAchieved >= 1);
        awardIfNew(user, "Sustainability Champ", goalsAchieved >= 3);
        awardIfNew(user, "Triple Achiever",      goalsAchieved >= 5);
        awardIfNew(user, "Goal Master",          goalsAchieved >= 10);

        // Content-based badges (from latest survey)
        awardIfNew(user, "Low Carbon Hero",   latestLowCarbon);
        awardIfNew(user, "Zero Emission Day", latestZeroTransport);
        awardIfNew(user, "Plant Power",       latestIsVegan);
        awardIfNew(user, "Solar Champion",    latestIsRenewable);
    }

    private void awardIfNew(User user, String badgeName, boolean condition) {
        if (!condition) return;
        if (badgeRepository.existsByUserIdAndBadgeName(user.getId(), badgeName)) return;

        BadgeDefinition def = badgeDefinitionRepository.findByBadgeName(badgeName).orElse(null);
        String icon = def != null ? def.getIcon() : "🎖️";
        String description = def != null ? def.getDescription() : "";

        badgeRepository.save(Badge.builder()
            .user(user)
            .badgeName(badgeName)
            .description(description)
            .awardedAt(LocalDateTime.now())
            .build());

        notificationService.push(user.getId(),
            "Badge Earned! " + icon,
            "You earned the \"" + badgeName + "\" badge. " + description,
            "BADGE");
    }

    @Transactional
    public BadgeResponse claimBadgeByEmail(Long badgeId, String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return claimBadge(badgeId, user.getId());
    }

    @Transactional
    public BadgeResponse claimBadge(Long badgeId, Long userId) {
        Badge badge = badgeRepository.findById(badgeId)
            .orElseThrow(() -> new RuntimeException("Badge not found"));
        if (!badge.getUser().getId().equals(userId))
            throw new RuntimeException("Unauthorized");
        if (Boolean.TRUE.equals(badge.getIsClaimed()))
            throw new RuntimeException("Badge already claimed");

        BadgeDefinition def = badgeDefinitionRepository.findByBadgeName(badge.getBadgeName()).orElse(null);
        int points = def != null && def.getRewardPoints() != null ? def.getRewardPoints() : 50;

        try {
            badge.setIsClaimed(true);
            badge.setClaimedAt(LocalDateTime.now());
            badge.setRewardPoints(points);
            Badge saved = badgeRepository.saveAndFlush(badge);

            notificationService.push(userId,
                "Badge Claimed! " + (def != null ? def.getIcon() : "🏆"),
                "You claimed \"" + badge.getBadgeName() + "\" and earned " + points + " eco points!",
                "BADGE");

            return toDto(saved);
        } catch (Exception e) {
            System.err.println("[BadgeService] claimBadge error for badge " + badgeId + ": " + e.getMessage());
            throw new RuntimeException("Failed to claim badge: " + e.getMessage());
        }
    }

    private BadgeResponse toDto(Badge b) {
        BadgeDefinition def = badgeDefinitionRepository.findByBadgeName(b.getBadgeName()).orElse(null);
        int points = b.getRewardPoints() != null ? b.getRewardPoints()
            : (def != null && def.getRewardPoints() != null ? def.getRewardPoints() : 50);
        return BadgeResponse.builder()
            .id(b.getId())
            .badgeName(b.getBadgeName())
            .description(def != null ? def.getDescription() : b.getDescription())
            .icon(def != null ? def.getIcon() : "🎖️")
            .bgColor(def != null ? def.getBgColor() : "bg-gray-50")
            .rarity(def != null ? def.getRarity() : "COMMON")
            .rewardPoints(points)
            .isClaimed(Boolean.TRUE.equals(b.getIsClaimed()))
            .awardedAt(b.getAwardedAt())
            .claimedAt(b.getClaimedAt())
            .build();
    }

    private BadgeDefinitionResponse toDefDto(BadgeDefinition d) {
        return BadgeDefinitionResponse.builder()
            .id(d.getId())
            .badgeName(d.getBadgeName())
            .description(d.getDescription())
            .icon(d.getIcon())
            .requirement(d.getRequirement())
            .bgColor(d.getBgColor())
            .rarity(d.getRarity())
            .rewardPoints(d.getRewardPoints())
            .createdAt(d.getCreatedAt())
            .build();
    }
}
