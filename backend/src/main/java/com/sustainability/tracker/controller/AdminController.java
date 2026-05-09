package com.sustainability.tracker.controller;

import com.sustainability.tracker.dto.*;
import com.sustainability.tracker.service.AdminService;
import com.sustainability.tracker.service.EmissionFactorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final EmissionFactorService emissionFactorService;

    @GetMapping("/users")
    public List<AdminUserDTO> getAllUsers() {
        return adminService.getAllUsers();
    }

    @PatchMapping("/users/{userId}/status")
    public AdminUserDTO updateUserStatus(@PathVariable Long userId,
                                         @Valid @RequestBody UpdateUserStatusRequest request) {
        return adminService.updateUserStatus(userId, request.getActive());
    }

    @GetMapping("/surveys/monitor")
    public List<SurveyMonitorDTO> getSurveyMonitoring(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return adminService.getSurveyMonitoringData(from, to);
    }

    @GetMapping("/carbon-logs")
    public List<AdminCarbonLogDTO> getCarbonLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return adminService.getAllCarbonLogs(from, to);
    }

    @PutMapping("/carbon-logs/{logId}")
    public AdminCarbonLogDTO updateCarbonLog(@PathVariable Long logId,
                                             @Valid @RequestBody CarbonLogUpdateRequest request) {
        return adminService.updateCarbonLog(logId, request);
    }

    @DeleteMapping("/carbon-logs/{logId}")
    public ResponseEntity<Void> deleteCarbonLog(@PathVariable Long logId) {
        adminService.deleteCarbonLog(logId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/carbon-logs/export")
    public ResponseEntity<String> exportCarbonLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        String csv = adminService.exportCarbonLogsCsv(from, to);

        return ResponseEntity.ok()
            .contentType(Objects.requireNonNull(MediaType.TEXT_PLAIN))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=carbon-logs-report.csv")
                .body(csv);
    }

    @GetMapping("/emission-factors")
    public List<EmissionFactorDTO> getEmissionFactors() {
        return emissionFactorService.getAllFactors();
    }

    @PutMapping("/emission-factors")
    public EmissionFactorDTO upsertEmissionFactor(@Valid @RequestBody EmissionFactorDTO request) {
        return emissionFactorService.upsertFactor(request);
    }

    @GetMapping("/analytics")
    public AdminAnalyticsDTO getAnalytics(@RequestParam(defaultValue = "6") int months) {
        return adminService.getAnalytics(months);
    }

    @GetMapping("/badges/definitions")
    public List<BadgeDefinitionDTO> getBadgeDefinitions() {
        return adminService.getBadgeDefinitions();
    }

    @PutMapping("/badges/definitions")
    public BadgeDefinitionDTO upsertBadgeDefinition(@Valid @RequestBody BadgeDefinitionDTO request) {
        return adminService.upsertBadgeDefinition(request);
    }

    @PostMapping("/badges/assign")
    public ResponseEntity<Map<String, String>> assignBadge(@Valid @RequestBody BadgeAssignmentRequest request) {
        boolean assigned = adminService.assignBadgeToUser(request);
        if (assigned) {
            return ResponseEntity.ok(Map.of("message", "Badge assigned successfully. User notification sent."));
        }
        return ResponseEntity.ok(Map.of("message", "User already has this badge."));
    }

    @PostMapping("/badges/assign-by-performance")
    public ResponseEntity<Map<String, Object>> assignBadgesByPerformance(
            @RequestParam(defaultValue = "10") int minReductionPercent) {
        int assigned = adminService.assignBadgesByPerformance(minReductionPercent);
        return ResponseEntity.ok(Map.of(
                "message", "Performance-based badge assignment completed",
                "assignedCount", assigned
        ));
    }
}
