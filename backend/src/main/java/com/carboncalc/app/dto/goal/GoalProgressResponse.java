package com.carboncalc.app.dto.goal;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalProgressResponse {

    private Long goalId;
    private String goalTitle;
    private Double targetEmission;
    private Double currentEmission;
    private Double progressPercentage;
}