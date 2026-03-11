package com.carbon.carbon.controller;

import com.carbon.carbon.dto.SurveyRequest;
import com.carbon.carbon.dto.SurveyResponse;
import com.carbon.carbon.entity.User;
import com.carbon.carbon.repository.UserRepository;
import com.carbon.carbon.service.SurveyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/survey")
@CrossOrigin
public class SurveyController {

    private final SurveyService surveyService;
    private final UserRepository userRepository;

    public SurveyController(SurveyService surveyService,
                            UserRepository userRepository) {
        this.surveyService = surveyService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @PostMapping
    public ResponseEntity<SurveyResponse> submitSurvey(
            @Valid @RequestBody SurveyRequest request) {

        SurveyResponse response =
                surveyService.processSurvey(getCurrentUser(), request);

        return ResponseEntity.ok(response);
    }
}