package com.deepika.carbontracker.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class LeaderboardRequest {

    private String teamName;
    private BigDecimal score;
}
