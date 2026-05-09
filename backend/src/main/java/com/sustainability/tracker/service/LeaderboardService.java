package com.sustainability.tracker.service;

import com.sustainability.tracker.entity.Leaderboard;
import com.sustainability.tracker.repository.LeaderboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final LeaderboardRepository leaderboardRepository;

    @Transactional(readOnly = true)
    public List<Leaderboard> getTopLeaderboard(int limit) {
        return leaderboardRepository.findTopByLimit(limit);
    }

    @Transactional
    public void refreshLeaderboard() {
        leaderboardRepository.refreshView();
    }
}
