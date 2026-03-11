package com.carbon.carbon.service;

import com.carbon.carbon.dto.BadgeDTO;
import com.carbon.carbon.entity.Badge;
import com.carbon.carbon.entity.User;
import com.carbon.carbon.repository.BadgeRepository;
import com.carbon.carbon.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserRepository userRepository;

    public BadgeService(BadgeRepository badgeRepository, UserRepository userRepository) {
        this.badgeRepository = badgeRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get all badges for a user
     */
    public List<BadgeDTO> getUserBadges(Long userId) {
        log.debug("Fetching all badges for user ID: {}", userId);
        
        if (userId == null) {
            log.warn("User ID is required");
            throw new IllegalArgumentException("User ID is required");
        }

        return badgeRepository.findByUserIdOrderByAwardedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get badge by ID
     */
    public BadgeDTO getBadgeById(Long badgeId) {
        log.debug("Fetching badge with ID: {}", badgeId);
        
        return badgeRepository.findById(badgeId)
                .map(this::convertToDTO)
                .orElseThrow(() -> {
                    log.warn("Badge not found with ID: {}", badgeId);
                    return new RuntimeException("Badge not found");
                });
    }

    /**
     * Award badge to a user (idempotent - won't create duplicate)
     */
    @Transactional
    public BadgeDTO awardBadge(Long userId, String badgeName, String description) {
        log.info("Awarding badge '{}' to user ID: {}", badgeName, userId);
        
        // Validate inputs
        if (userId == null) {
            log.warn("User ID is required");
            throw new IllegalArgumentException("User ID is required");
        }
        
        if (badgeName == null || badgeName.trim().isEmpty()) {
            log.warn("Badge name is required");
            throw new IllegalArgumentException("Badge name is required");
        }

        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new RuntimeException("User not found");
                });

        // Check if user already has this badge (idempotent)
        if (badgeRepository.existsByUserIdAndBadgeName(userId, badgeName.trim())) {
            log.info("User ID: {} already has badge: {}", userId, badgeName);
            return badgeRepository.findByUserIdAndBadgeName(userId, badgeName.trim())
                    .map(this::convertToDTO)
                    .orElseThrow();
        }

        Badge badge = new Badge();
        badge.setUser(user);
        badge.setBadgeName(badgeName.trim());
        badge.setDescription(description);

        Badge saved = badgeRepository.save(badge);
        log.info("Badge awarded successfully with ID: {}", saved.getId());
        return convertToDTO(saved);
    }

    /**
     * Check if user has a specific badge
     */
    public boolean hasBadge(Long userId, String badgeName) {
        log.debug("Checking if user ID: {} has badge: {}", userId, badgeName);
        
        if (userId == null || badgeName == null) {
            log.warn("User ID and badge name are required");
            return false;
        }

        return badgeRepository.existsByUserIdAndBadgeName(userId, badgeName);
    }

    /**
     * Get badge count for a user
     */
    public long getUserBadgeCount(Long userId) {
        log.debug("Counting badges for user ID: {}", userId);
        
        if (userId == null) {
            log.warn("User ID is required");
            throw new IllegalArgumentException("User ID is required");
        }

        return badgeRepository.countByUserId(userId);
    }

    /**
     * Remove badge from user
     */
    @Transactional
    public void removeBadge(Long badgeId) {
        log.info("Removing badge with ID: {}", badgeId);
        
        if (!badgeRepository.existsById(badgeId)) {
            log.warn("Badge not found with ID: {}", badgeId);
            throw new RuntimeException("Badge not found");
        }

        badgeRepository.deleteById(badgeId);
        log.info("Badge removed successfully");
    }

    /**
     * Define achievement thresholds for auto-awarding badges
     */
    public void checkAndAwardAchievementBadges(Long userId, double totalEmissions, long goalCount, long transactionCount) {
        log.debug("Checking achievement badges for user ID: {}", userId);
        
        if (userId == null) {
            log.warn("User ID is required");
            return;
        }

        try {
            // Carbon Tracker Badge - First emission logged
            if (totalEmissions > 0 && !hasBadge(userId, "Carbon Tracker")) {
                awardBadge(userId, "Carbon Tracker", "Logged your first carbon emission");
            }

            // Goal Setter Badge - Created first goal
            if (goalCount > 0 && !hasBadge(userId, "Goal Setter")) {
                awardBadge(userId, "Goal Setter", "Created your first carbon reduction goal");
            }

            // Green Shopper Badge - Made first marketplace purchase
            if (transactionCount > 0 && !hasBadge(userId, "Green Shopper")) {
                awardBadge(userId, "Green Shopper", "Made your first carbon credit purchase");
            }

            // Eco Warrior Badge - 100+ kg CO2 reduction
            if (totalEmissions >= 100 && !hasBadge(userId, "Eco Warrior")) {
                awardBadge(userId, "Eco Warrior", "Reduced 100+ kg of CO2 emissions");
            }

            // Carbon Champion Badge - 500+ kg CO2 reduction
            if (totalEmissions >= 500 && !hasBadge(userId, "Carbon Champion")) {
                awardBadge(userId, "Carbon Champion", "Reduced 500+ kg of CO2 emissions");
            }

            log.debug("Achievement badges check completed for user ID: {}", userId);
        } catch (Exception e) {
            log.error("Error checking achievement badges for user ID: {}", userId, e);
        }
    }

    /**
     * Convert entity to DTO
     */
    private BadgeDTO convertToDTO(Badge badge) {
        return new BadgeDTO(
                badge.getId(),
                badge.getUser().getId(),
                badge.getBadgeName(),
                badge.getDescription(),
                badge.getAwardedAt()
        );
    }
}
