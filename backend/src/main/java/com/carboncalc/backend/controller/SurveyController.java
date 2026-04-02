package com.carboncalc.backend.controller;

import com.carboncalc.backend.dto.DashboardResponse;
import com.carboncalc.backend.dto.SurveyRequest;
import com.carboncalc.backend.dto.SurveyResponse;
import com.carboncalc.backend.entity.Survey;
import com.carboncalc.backend.repository.UserRepository;
import com.carboncalc.backend.service.DashboardService;
import com.carboncalc.backend.service.SurveyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;
    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    private Long currentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found")).getId();
    }

    /** POST /api/survey */
    @PostMapping("/survey")
    public ResponseEntity<SurveyResponse> submitSurvey(@Valid @RequestBody SurveyRequest request) {
        Survey survey = surveyService.submitSurvey(request, currentUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(survey));
    }

    /** GET /api/carbon/history  (alias kept for backward compat) */
    @GetMapping("/carbon/history")
    public ResponseEntity<List<SurveyResponse>> getCarbonHistory() {
        List<SurveyResponse> response = surveyService.getUserSurveys(currentUserId())
            .stream().map(this::toDto).toList();
        return ResponseEntity.ok(response);
    }

    /** GET /api/carbon/logs?from=2024-01-01&to=2024-12-31 */
    @GetMapping("/carbon/logs")
    public ResponseEntity<List<SurveyResponse>> getCarbonLogs(
            @RequestParam(name = "from", required = false) String from,
            @RequestParam(name = "to",   required = false) String to) {

        try {
            Long userId = currentUserId();
            System.out.println("[SurveyController] getCarbonLogs - userId: " + userId + ", from: " + from + ", to: " + to);
            
            List<Survey> surveys = surveyService.getUserSurveys(userId);
            System.out.println("[SurveyController] Found " + surveys.size() + " surveys for user " + userId);

            LocalDate fromDate = null;
            LocalDate toDate = null;
            try {
                if (from != null && !from.isBlank()) fromDate = LocalDate.parse(from);
                if (to   != null && !to.isBlank())   toDate   = LocalDate.parse(to);
            } catch (Exception e) {
                System.out.println("[SurveyController] Invalid date format - ignoring filter");
            }

            final LocalDate finalFrom = fromDate;
            final LocalDate finalTo   = toDate;

            List<SurveyResponse> response = surveys.stream()
                .filter(s -> {
                    if (s.getDate() == null) return true;
                    LocalDate d = s.getDate().toLocalDate();
                    boolean afterFrom = (finalFrom == null) || !d.isBefore(finalFrom);
                    boolean beforeTo  = (finalTo   == null) || !d.isAfter(finalTo);
                    return afterFrom && beforeTo;
                })
                .map(this::toDto)
                .toList();

            System.out.println("[SurveyController] Returning " + response.size() + " filtered surveys");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("[SurveyController] Error in getCarbonLogs: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }

    /** GET /api/dashboard */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboardData(currentUserId()));
    }

    private SurveyResponse toDto(Survey s) {
        return SurveyResponse.builder()
            .id(s.getId())
            .transport(s.getTransport())
            .distanceKm(s.getDistanceKm())
            .fuelType(s.getFuelType())
            .food(s.getFood())
            .mealsPerDay(s.getMealsPerDay())
            .eatingOutFrequency(s.getEatingOutFrequency())
            .energy(s.getEnergy())
            .renewableEnergy(s.getRenewableEnergy())
            .transportEmission(s.getTransportEmission())
            .foodEmission(s.getFoodEmission())
            .energyEmission(s.getEnergyEmission())
            .carbonScore(s.getCarbonScore())
            .date(s.getDate())
            .build();
    }
}
