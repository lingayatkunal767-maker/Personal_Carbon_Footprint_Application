package com.carbon.carbontracker.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;

import com.carbon.carbontracker.repository.CarbonLogRepository;
import com.carbon.carbontracker.repository.UserRepository;
import com.carbon.carbontracker.model.User;
import com.carbon.carbontracker.model.CarbonLog;

@RestController
@RequestMapping("/api/carbon")
public class CarbonLogController {

    @Autowired
    private CarbonLogRepository carbonLogRepository;

    @Autowired
    private UserRepository userRepository;

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


}