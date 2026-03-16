package com.carboncalc.app.dto.survey;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyFrequencyDto {

    private String category;
    private Integer count;
}