package com.carboncalc.app.dto.survey;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyResponse {

    private Long id;
    private String message;
}