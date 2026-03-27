package com.ecotrack.backend.service;


import com.ecotrack.backend.dto.BadgeDTO;
import com.ecotrack.backend.entity.Badge;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.entity.UserBadge;
import com.ecotrack.backend.repository.BadgeRepository;
import com.ecotrack.backend.repository.UserBadgeRepository;
import com.ecotrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BadgeService {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Autowired
    private UserRepository userRepository;

    public List<BadgeDTO> getBadgesForUser(Long userId) {
        List<Badge> allBadges = badgeRepository.findAll();
        List<UserBadge> earnedBadges = userBadgeRepository.findByUserId(userId);

        return allBadges.stream().map(badge -> {
            BadgeDTO dto = new BadgeDTO();
            dto.setName(badge.getName());
            dto.setType(badge.getType());
            dto.setIconName(badge.getIconName());
            dto.setDescription(badge.getDescription());
            dto.setColor(badge.getColor());
            dto.setBgColor(badge.getBgColor());

            // Check if this badge is in the user's earned list
            Optional<UserBadge> achievement = earnedBadges.stream()
                    .filter(ub -> ub.getBadge().getId().equals(badge.getId()))
                    .findFirst();

            dto.setEarned(achievement.isPresent());
            achievement.ifPresent(ub -> dto.setDate(ub.getEarnedAt().toString()));

            return dto;
        }).collect(Collectors.toList());
    }

    public void awardBadge(Long userId, String badgeName) {
        // 1. Check if user already has this specific badge
        boolean alreadyOwned = userBadgeRepository.existsByUserIdAndBadgeName(userId, badgeName);

        if (!alreadyOwned) {
            // 2. Find the badge definition from the DB
            Optional<Badge> badgeOpt = badgeRepository.findByName(badgeName);

            if (badgeOpt.isPresent()) {
                UserBadge newBadge = new UserBadge();
                newBadge.setUser(userRepository.findById(userId).get());
                newBadge.setBadge(badgeOpt.get());
                userBadgeRepository.save(newBadge);
                System.out.println("Badge Awarded: " + badgeName + " to User: " + userId);
            }
        }
    }

    public List<BadgeDTO> getBadgesForCurrentUser() {
        // 1. Get the authenticated user principal
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        // 2. Reuse your existing DTO logic!
        // This ensures all badges are sent, with 'earned' set to true/false
        return getBadgesForUser(user.getId());
    }


}