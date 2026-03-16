package com.carboncalc.app.controller;

import com.carboncalc.app.dto.common.ApiResponse;
import com.carboncalc.app.dto.survey.SurveyRequest;
import com.carboncalc.app.dto.survey.SurveyResponse;
import com.carboncalc.app.service.survey.SurveyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/survey")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;

    @PostMapping("/{userId}")
    public ApiResponse<SurveyResponse> submitSurvey(@PathVariable Long userId,
                                                    @RequestBody SurveyRequest request) {
        return ApiResponse.<SurveyResponse>builder()
                .success(true)
                .message("Survey submitted successfully")
                .data(surveyService.submitSurvey(userId, request))
                .build();
    }
}