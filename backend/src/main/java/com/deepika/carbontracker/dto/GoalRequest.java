package com.deepika.carbontracker.dto;

import com.deepika.carbontracker.model.Goal.GoalStatus;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class GoalRequest {

    private String goalTitle;
    private BigDecimal targetEmission;
    private BigDecimal currentEmission;
    private GoalStatus status;
}
