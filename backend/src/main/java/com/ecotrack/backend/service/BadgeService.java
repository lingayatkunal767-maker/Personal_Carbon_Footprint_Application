package com.ecotrack.backend.service;

import com.ecotrack.backend.dto.BadgeDTO;
import com.ecotrack.backend.entity.Badge;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.entity.UserBadge;
import com.ecotrack.backend.repository.BadgeRepository;
import com.ecotrack.backend.repository.UserBadgeRepository;
import com.ecotrack.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository        badgeRepository;
    private final UserBadgeRepository    userBadgeRepository;
    private final UserRepository         userRepository;
    private final NotificationService    notificationService;

    public List<BadgeDTO> getBadgesForUser(Long userId) {
        List<Badge>     allBadges    = badgeRepository.findAll();
        List<UserBadge> earnedBadges = userBadgeRepository.findByUserId(userId);

        return allBadges.stream().map(badge -> {
            BadgeDTO dto = new BadgeDTO();
            dto.setName(badge.getName());
            dto.setType(badge.getType());
            dto.setIconName(badge.getIconName() != null ? badge.getIconName() : badge.getIcon());
            dto.setDescription(badge.getDescription());
            dto.setColor(badge.getColor());
            dto.setBgColor(badge.getBgColor());

            Optional<UserBadge> achievement = earnedBadges.stream()
                    .filter(ub -> ub.getBadge().getId().equals(badge.getId()))
                    .findFirst();

            dto.setEarned(achievement.isPresent());
            achievement.ifPresent(ub -> dto.setDate(ub.getEarnedAt().toString()));
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Awards a badge to a user and fires a notification.
     */
    public void awardBadge(Long userId, String badgeName) {
        boolean alreadyOwned = userBadgeRepository.existsByUserIdAndBadgeName(userId, badgeName);
        if (alreadyOwned) return;

        Optional<Badge> badgeOpt = badgeRepository.findByName(badgeName);
        if (badgeOpt.isEmpty()) return;

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        UserBadge newBadge = new UserBadge();
        newBadge.setUser(user);
        newBadge.setBadge(badgeOpt.get());
        userBadgeRepository.save(newBadge);

        // ✅ Send notification to user
        notificationService.notifyBadgeEarned(user, badgeName);

        System.out.println("Badge Awarded: " + badgeName + " to User: " + userId);
    }

    public List<BadgeDTO> getBadgesForCurrentUser() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return getBadgesForUser(user.getId());
    }
}
