package com.carboncalc.app.service.leaderboard;

import com.carboncalc.app.dto.leaderboard.LeaderboardEntryResponse;
import com.carboncalc.app.dto.leaderboard.LeaderboardResponse;
import com.carboncalc.app.entity.Leaderboard;
import com.carboncalc.app.repository.LeaderboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final LeaderboardRepository leaderboardRepository;

    public LeaderboardResponse getLeaderboard() {
        List<Leaderboard> records = leaderboardRepository.findAllByOrderByScoreDesc();
        List<LeaderboardEntryResponse> entries = new ArrayList<>();

        int rank = 1;
        for (Leaderboard record : records) {
            entries.add(LeaderboardEntryResponse.builder()
                    .userId(record.getUser().getId())
                    .userName(record.getUser().getName())
                    .teamName(record.getTeamName())
                    .score(record.getScore())
                    .rank(rank++)
                    .build());
        }

        return LeaderboardResponse.builder()
                .entries(entries)
                .build();
    }
}