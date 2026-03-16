package com.carboncalc.app.dto.goal;

import com.carboncalc.app.enums.GoalStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalResponse {

    private Long id;
    private String goalTitle;
    private Double targetEmission;
    private Double currentEmission;
    private GoalStatus status;
}