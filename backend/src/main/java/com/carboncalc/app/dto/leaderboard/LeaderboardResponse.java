package com.carboncalc.app.dto.leaderboard;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardResponse {

    private List<LeaderboardEntryResponse> entries;
}