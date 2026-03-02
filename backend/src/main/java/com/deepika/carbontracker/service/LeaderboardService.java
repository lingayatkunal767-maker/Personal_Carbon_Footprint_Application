package com.deepika.carbontracker.service;

import com.deepika.carbontracker.dto.LeaderboardRequest;
import com.deepika.carbontracker.dto.LeaderboardResponse;
import com.deepika.carbontracker.model.Leaderboard;
import com.deepika.carbontracker.model.User;
import com.deepika.carbontracker.repository.LeaderboardRepository;
import com.deepika.carbontracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {

    @Autowired
    private LeaderboardRepository leaderboardRepository;

    @Autowired
    private UserRepository userRepository;

    // ---------------------------------------------------------------
    // Submit or update score for a user (upsert)
    // ---------------------------------------------------------------
    public LeaderboardResponse submitScore(Long userId, LeaderboardRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Upsert: update existing entry or create new one
        Leaderboard entry = leaderboardRepository.findFirstByUserId(userId)
                .orElse(Leaderboard.builder().user(user).build());

        entry.setTeamName(request.getTeamName());
        entry.setScore(request.getScore());

        Leaderboard saved = leaderboardRepository.save(entry);
        return toResponse(saved);
    }

    // ---------------------------------------------------------------
    // Get global leaderboard sorted by score descending
    // ---------------------------------------------------------------
    public List<LeaderboardResponse> getLeaderboard() {
        return leaderboardRepository.findAllByOrderByScoreDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    // Get entries for a specific user
    // ---------------------------------------------------------------
    public List<LeaderboardResponse> getMyEntries(Long userId) {
        return leaderboardRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    // Mapping helper
    // ---------------------------------------------------------------
    private LeaderboardResponse toResponse(Leaderboard entry) {
        return LeaderboardResponse.builder()
                .id(entry.getId())
                .userId(entry.getUser().getId())
                .userName(entry.getUser().getName())
                .teamName(entry.getTeamName())
                .score(entry.getScore())
                .updatedAt(entry.getUpdatedAt())
                .build();
    }
}
