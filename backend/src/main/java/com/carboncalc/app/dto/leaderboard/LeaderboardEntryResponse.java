package com.carboncalc.app.dto.leaderboard;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardEntryResponse {

    private Long userId;
    private String userName;
    private String teamName;
    private Double score;
    private Integer rank;
}