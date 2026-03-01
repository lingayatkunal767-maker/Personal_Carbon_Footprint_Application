package com.carbon.carbontracker.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import com.carbon.carbontracker.dto.SurveyRequest;
import com.carbon.carbontracker.service.SurveyService;

@RestController
@RequestMapping("/api")
public class SurveyController {

    @Autowired
    private SurveyService surveyService;

    @PostMapping("/survey")
    public ResponseEntity<?> submitSurvey(
            @RequestBody SurveyRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        surveyService.processSurvey(request, email);

        return ResponseEntity.ok("Survey submitted successfully");
    }
}