package com.ecotrack.backend.controller;

import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.CarbonEntryRepository;
import com.ecotrack.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class LeaderboardController {
    private final UserRepository userRepo;
    private final CarbonEntryRepository carbonRepo;

    @GetMapping
    public ResponseEntity<?> get(@AuthenticationPrincipal User currentUser) {
        List<Map<String, Object>> entries = new ArrayList<>();
        for (User u : userRepo.findAll()) {
            Double t = carbonRepo.sumByUser(u);
            double kg = t != null ? Math.round(t * 10.0) / 10.0 : 0.0;
            Map<String, Object> e = new LinkedHashMap<>();
            e.put("userId", u.getId()); e.put("userName", u.getName());
            e.put("totalCarbonKg", kg); e.put("badgeCount", 0);
            e.put("isCurrentUser", u.getId().equals(currentUser.getId()));
            entries.add(e);
        }
        entries.sort(Comparator.comparingDouble(e -> (double) e.get("totalCarbonKg")));
        for (int i = 0; i < entries.size(); i++) entries.get(i).put("rank", i + 1);

        int myRank = entries.stream().filter(e -> Boolean.TRUE.equals(e.get("isCurrentUser")))
                .mapToInt(e -> (int) e.get("rank")).findFirst().orElse(1);
        Double myT = carbonRepo.sumByUser(currentUser);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("entries", entries);
        result.put("currentUserRank", myRank);
        result.put("currentUserTotal", myT != null ? Math.round(myT * 10.0) / 10.0 : 0.0);
        return ResponseEntity.ok(result);
    }
}
