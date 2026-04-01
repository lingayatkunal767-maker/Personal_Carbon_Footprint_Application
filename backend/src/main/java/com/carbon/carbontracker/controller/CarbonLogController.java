package com.carbon.carbontracker.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.math.BigDecimal;

import com.carbon.carbontracker.repository.CarbonLogRepository;
import com.carbon.carbontracker.repository.UserRepository;
import com.carbon.carbontracker.model.User;
import com.carbon.carbontracker.model.CarbonLog;
import com.carbon.carbontracker.dto.UpdateLogRequest;

@RestController
@RequestMapping("/api/carbon")
public class CarbonLogController {

    @Autowired
    private CarbonLogRepository carbonLogRepository;

    @Autowired
    private UserRepository userRepository;

    // ------------------------------------------------------------------
    // User-scoped logs (existing behaviour, used by user-facing pages)
    // ------------------------------------------------------------------
    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(
            Authentication authentication,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        if (from != null && to != null) {

            LocalDate start = LocalDate.parse(from);
            LocalDate end = LocalDate.parse(to);

            return ResponseEntity.ok(
                    carbonLogRepository.findByUserAndDateBetween(user, start, end)
            );
        }

        return ResponseEntity.ok(
                carbonLogRepository.findByUser(user)
        );
    }

    // ------------------------------------------------------------------
    // Admin view: logs for all non-admin users (used in Analytics tab)
    // ------------------------------------------------------------------
    @GetMapping("/logs/admin/all")
    public ResponseEntity<?> getAllLogsForAdmin() {

        return ResponseEntity.ok(
                carbonLogRepository.findAll()
                        .stream()
                        .filter(log -> {
                            User u = log.getUser();
                            if (u == null || u.getRole() == null) return true;
                            String r = u.getRole().trim().toLowerCase();
                            return !r.contains("admin");
                        })
                        .toList()
        );
    }

    @GetMapping("/logs/{id}")
    public ResponseEntity<?> getLog(@PathVariable("id") Long id, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return carbonLogRepository.findByIdAndUser(id, user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/logs/{id}")
    public ResponseEntity<?> updateLog(
            @PathVariable("id") Long id,
            @RequestBody UpdateLogRequest body,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        CarbonLog log = carbonLogRepository.findByIdAndUser(id, user).orElse(null);
        if (log == null) {
            return ResponseEntity.notFound().build();
        }
        if (body.getTransportEmission() != null) log.setTransportEmission(body.getTransportEmission());
        if (body.getFoodEmission() != null) log.setFoodEmission(body.getFoodEmission());
        if (body.getEnergyEmission() != null) log.setEnergyEmission(body.getEnergyEmission());
        if (body.getTotalEmission() != null) {
            log.setTotalEmission(body.getTotalEmission());
        } else {
            BigDecimal total = BigDecimal.ZERO;
            if (log.getTransportEmission() != null) total = total.add(log.getTransportEmission());
            if (log.getFoodEmission() != null) total = total.add(log.getFoodEmission());
            if (log.getEnergyEmission() != null) total = total.add(log.getEnergyEmission());
            log.setTotalEmission(total);
        }
        // update lifestyle snapshot if provided
        if (body.getTransportMode() != null) log.setTransportMode(body.getTransportMode());
        if (body.getDistancePerDay() != null) log.setDistancePerDay(body.getDistancePerDay());
        if (body.getFuelType() != null) log.setFuelType(body.getFuelType());

        if (body.getDietType() != null) log.setDietType(body.getDietType());
        if (body.getMealsPerDay() != null) log.setMealsPerDay(body.getMealsPerDay());
        if (body.getEatingOutFrequency() != null) log.setEatingOutFrequency(body.getEatingOutFrequency());

        if (body.getMonthlyElectricity() != null) log.setMonthlyElectricity(body.getMonthlyElectricity());
        if (body.getRenewable() != null) log.setRenewable(body.getRenewable());

        carbonLogRepository.save(log);
        return ResponseEntity.ok(log);
    }
}