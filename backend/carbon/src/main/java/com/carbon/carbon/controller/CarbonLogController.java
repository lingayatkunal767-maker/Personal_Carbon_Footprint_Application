package com.carbon.carbon.controller;

import com.carbon.carbon.entity.CarbonLog;
import com.carbon.carbon.entity.User;
import com.carbon.carbon.repository.CarbonLogRepository;
import com.carbon.carbon.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/carbon/logs")
@CrossOrigin
public class CarbonLogController {

    private final CarbonLogRepository carbonLogRepository;
    private final UserRepository userRepository;

    public CarbonLogController(CarbonLogRepository carbonLogRepository,
                                UserRepository userRepository) {
        this.carbonLogRepository = carbonLogRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @GetMapping
    public List<CarbonLog> getLogs(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to) {

        User user = getCurrentUser();

        if (from != null && to != null) {
            return carbonLogRepository.findByUserAndDateBetween(user, from, to);
        }

        return carbonLogRepository.findByUserOrderByDateDesc(user);
    }
}