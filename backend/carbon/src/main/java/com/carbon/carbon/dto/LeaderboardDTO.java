package com.carbon.carbon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardDTO {
    private Long id;
    private String teamName;
    private Long userId;
    private String userName;
    private BigDecimal score;
    private LocalDateTime updatedAt;
}
