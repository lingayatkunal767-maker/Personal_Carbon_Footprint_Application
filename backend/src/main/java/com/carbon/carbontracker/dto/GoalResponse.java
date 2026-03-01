
package com.carbon.carbontracker.dto;

import com.carbon.carbontracker.model.Goal.GoalStatus;
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
public class GoalResponse {

    private Long id;
    private Long userId;
    private String goalTitle;
    private BigDecimal targetEmission;
    private BigDecimal currentEmission;
    private GoalStatus status;
    private LocalDateTime createdAt;
}
