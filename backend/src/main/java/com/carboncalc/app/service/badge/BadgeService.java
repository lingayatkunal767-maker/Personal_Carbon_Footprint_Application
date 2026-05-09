package com.carboncalc.app.service.badge;

import com.carboncalc.app.dto.badge.BadgeResponse;
import com.carboncalc.app.entity.Badge;
import com.carboncalc.app.entity.User;
import com.carboncalc.app.enums.BadgeType;
import com.carboncalc.app.repository.BadgeRepository;
import com.carboncalc.app.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserService userService;

    public List<BadgeResponse> getBadges(Long userId) {
        User user = userService.getUserEntity(userId);
        return badgeRepository.findByUser(user).stream().map(this::toResponse).toList();
    }

    public BadgeResponse awardBadge(Long userId, BadgeType badgeType, String description) {
        User user = userService.getUserEntity(userId);

        Badge badge = Badge.builder()
                .user(user)
                .badgeName(badgeType)
                .description(description)
                .awardedAt(LocalDateTime.now())
                .build();

        badge = badgeRepository.save(badge);
        return toResponse(badge);
    }

    private BadgeResponse toResponse(Badge badge) {
        return BadgeResponse.builder()
                .id(badge.getId())
                .badgeName(badge.getBadgeName())
                .description(badge.getDescription())
                .awardedAt(badge.getAwardedAt())
                .build();
    }
}