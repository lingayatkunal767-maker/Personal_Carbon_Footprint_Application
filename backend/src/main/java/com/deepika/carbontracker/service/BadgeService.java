package com.deepika.carbontracker.service;

import com.deepika.carbontracker.dto.BadgeRequest;
import com.deepika.carbontracker.dto.BadgeResponse;
import com.deepika.carbontracker.model.Badge;
import com.deepika.carbontracker.model.User;
import com.deepika.carbontracker.repository.BadgeRepository;
import com.deepika.carbontracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BadgeService {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserRepository userRepository;

    // ---------------------------------------------------------------
    // Award a badge to a user (skips if already awarded)
    // ---------------------------------------------------------------
    public BadgeResponse awardBadge(Long userId, BadgeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Prevent duplicate awards for the same badge name
        if (badgeRepository.existsByUserIdAndBadgeName(userId, request.getBadgeName())) {
            throw new RuntimeException("Badge '" + request.getBadgeName() + "' already awarded to this user");
        }

        Badge badge = Badge.builder()
                .user(user)
                .badgeName(request.getBadgeName())
                .description(request.getDescription())
                .build();

        Badge saved = badgeRepository.save(badge);
        return toResponse(saved);
    }

    // ---------------------------------------------------------------
    // Get all badges earned by a user
    // ---------------------------------------------------------------
    public List<BadgeResponse> getBadgesByUser(Long userId) {
        return badgeRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    // Mapping helper
    // ---------------------------------------------------------------
    private BadgeResponse toResponse(Badge badge) {
        return BadgeResponse.builder()
                .id(badge.getId())
                .userId(badge.getUser().getId())
                .badgeName(badge.getBadgeName())
                .description(badge.getDescription())
                .awardedAt(badge.getAwardedAt())
                .build();
    }
}
