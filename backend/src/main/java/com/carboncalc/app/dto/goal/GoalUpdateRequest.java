package com.carboncalc.app.dto.goal;

import com.carboncalc.app.enums.GoalStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalUpdateRequest {

    private String goalTitle;
    private Double targetEmission;
    private Double currentEmission;
    private GoalStatus status;
}