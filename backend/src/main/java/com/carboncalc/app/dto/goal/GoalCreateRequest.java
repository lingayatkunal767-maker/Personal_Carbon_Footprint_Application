package com.carboncalc.app.dto.goal;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalCreateRequest {

    private String goalTitle;
    private Double targetEmission;
}