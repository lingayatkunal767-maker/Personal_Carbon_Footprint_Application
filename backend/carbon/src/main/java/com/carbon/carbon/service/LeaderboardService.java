package com.carbon.carbon.service;

import com.carbon.carbon.dto.LeaderboardDTO;
import com.carbon.carbon.entity.Leaderboard;
import com.carbon.carbon.entity.User;
import com.carbon.carbon.repository.LeaderboardRepository;
import com.carbon.carbon.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
public class LeaderboardService {

    private final LeaderboardRepository leaderboardRepository;
    private final UserRepository userRepository;

    public LeaderboardService(LeaderboardRepository leaderboardRepository, UserRepository userRepository) {
        this.leaderboardRepository = leaderboardRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get all leaderboard entries sorted by score
     */
    public List<LeaderboardDTO> getAllLeaderboards() {
        log.debug("Fetching all leaderboard entries");
        return leaderboardRepository.findAllByOrderByScoreDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get top N leaderboard users
     */
    public List<LeaderboardDTO> getTopLeaderboardUsers(int limit) {
        log.debug("Fetching top {} leaderboard users", limit);
        if (limit <= 0) {
            log.warn("Limit must be greater than 0");
            throw new IllegalArgumentException("Limit must be greater than 0");
        }
        return leaderboardRepository.findTopLeaderboardUsers(limit)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get leaderboard entry for a user
     */
    public LeaderboardDTO getUserLeaderboard(Long userId) {
        log.debug("Fetching leaderboard entry for user ID: {}", userId);
        return leaderboardRepository.findByUserId(userId)
                .map(this::convertToDTO)
                .orElseThrow(() -> {
                    log.warn("Leaderboard entry not found for user ID: {}", userId);
                    return new RuntimeException("Leaderboard entry not found for this user");
                });
    }

    /**
     * Initialize leaderboard entry for a user
     */
    @Transactional
    public LeaderboardDTO initializeUserLeaderboard(Long userId, String teamName) {
        log.info("Initializing leaderboard entry for user ID: {} with team: {}", userId, teamName);
        
        if (userId == null) {
            log.warn("User ID is required");
            throw new IllegalArgumentException("User ID is required");
        }
        
        if (teamName == null || teamName.trim().isEmpty()) {
            log.warn("Team name is required");
            throw new IllegalArgumentException("Team name is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new RuntimeException("User not found");
                });

        if (leaderboardRepository.findByUserId(userId).isPresent()) {
            log.warn("Leaderboard entry already exists for user ID: {}", userId);
            throw new RuntimeException("Leaderboard entry already exists for this user");
        }

        Leaderboard leaderboard = new Leaderboard();
        leaderboard.setUser(user);
        leaderboard.setTeamName(teamName.trim());
        leaderboard.setScore(BigDecimal.ZERO);
        leaderboard.setUpdatedAt(LocalDateTime.now());

        Leaderboard saved = leaderboardRepository.save(leaderboard);
        log.info("Leaderboard entry created for user ID: {}", userId);
        return convertToDTO(saved);
    }

    /**
     * Update user score in leaderboard
     */
    @Transactional
    public LeaderboardDTO updateUserScore(Long userId, BigDecimal scoreIncrease) {
        log.info("Updating leaderboard score for user ID: {} with increase: {}", userId, scoreIncrease);
        
        if (userId == null) {
            log.warn("User ID is required");
            throw new IllegalArgumentException("User ID is required");
        }
        
        if (scoreIncrease == null || scoreIncrease.compareTo(BigDecimal.ZERO) < 0) {
            log.warn("Score increase must be non-negative");
            throw new IllegalArgumentException("Score increase must be non-negative");
        }

        Leaderboard leaderboard = leaderboardRepository.findByUserId(userId)
                .orElseThrow(() -> {
                    log.warn("Leaderboard entry not found for user ID: {}", userId);
                    return new RuntimeException("Leaderboard entry not found for this user");
                });

        leaderboard.setScore(leaderboard.getScore().add(scoreIncrease));
        leaderboard.setUpdatedAt(LocalDateTime.now());

        Leaderboard updated = leaderboardRepository.save(leaderboard);
        log.info("Leaderboard score updated successfully for user ID: {}", userId);
        return convertToDTO(updated);
    }

    /**
     * Change user's team
     */
    @Transactional
    public LeaderboardDTO changeUserTeam(Long userId, String newTeamName) {
        log.info("Changing team for user ID: {} to: {}", userId, newTeamName);
        
        if (newTeamName == null || newTeamName.trim().isEmpty()) {
            log.warn("Team name is required");
            throw new IllegalArgumentException("Team name is required");
        }

        Leaderboard leaderboard = leaderboardRepository.findByUserId(userId)
                .orElseThrow(() -> {
                    log.warn("Leaderboard entry not found for user ID: {}", userId);
                    return new RuntimeException("Leaderboard entry not found for this user");
                });

        leaderboard.setTeamName(newTeamName.trim());
        leaderboard.setUpdatedAt(LocalDateTime.now());

        Leaderboard updated = leaderboardRepository.save(leaderboard);
        log.info("User team changed successfully");
        return convertToDTO(updated);
    }

    /**
     * Convert entity to DTO
     */
    private LeaderboardDTO convertToDTO(Leaderboard leaderboard) {
        return new LeaderboardDTO(
                leaderboard.getId(),
                leaderboard.getTeamName(),
                leaderboard.getUser().getId(),
                leaderboard.getUser().getName(),
                leaderboard.getScore(),
                leaderboard.getUpdatedAt()
        );
    }
}
