package com.sustainability.tracker.controller;

import com.sustainability.tracker.dto.SurveyRequest;
import com.sustainability.tracker.dto.SurveyResponse;
import com.sustainability.tracker.dto.DatasetInsightsDTO;
import com.sustainability.tracker.service.SurveyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/survey")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SurveyResponse submitSurvey(@Valid @RequestBody SurveyRequest request) {
        return surveyService.processSurvey(request);
    }

    @GetMapping("/insights/user/{userId}")
    public DatasetInsightsDTO getDatasetInsights(@PathVariable Long userId) {
        return surveyService.getDatasetInsights(userId);
    }
}
