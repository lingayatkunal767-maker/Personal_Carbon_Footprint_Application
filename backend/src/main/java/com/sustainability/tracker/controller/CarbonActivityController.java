package com.sustainability.tracker.controller;

import com.sustainability.tracker.dto.ActivityRequest;
import com.sustainability.tracker.dto.ActivityResponse;
import com.sustainability.tracker.service.CarbonActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class CarbonActivityController {

    private final CarbonActivityService activityService;

    // GET /api/activities/user/{userId}
    @GetMapping("/user/{userId}")
    public List<ActivityResponse> getByUser(@PathVariable Long userId) {
        return activityService.getActivitiesByUser(userId);
    }

    // GET /api/activities/user/{userId}/range?start=2026-01-01&end=2026-01-31
    @GetMapping("/user/{userId}/range")
    public List<ActivityResponse> getByDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return activityService.getActivitiesByDateRange(userId, start, end);
    }

    // POST /api/activities
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ActivityResponse create(@RequestBody ActivityRequest request) {
        return activityService.createActivity(request);
    }

    // DELETE /api/activities/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        activityService.deleteActivity(id);
    }
}
