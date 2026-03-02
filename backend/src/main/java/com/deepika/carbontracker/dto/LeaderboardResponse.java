package com.deepika.carbontracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String teamName;
    private BigDecimal score;
    private LocalDateTime updatedAt;
}
